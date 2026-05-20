const os = require('os');
const { spawn } = require('child_process');

function isPrivateIpv4(address) {
  return (
    /^10\./.test(address) ||
    /^192\.168\./.test(address) ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(address)
  );
}

function getPreferredLanIp() {
  const interfaces = os.networkInterfaces();
  const preferredNamePatterns = [/wi-?fi/i, /wlan/i, /ethernet/i];
  const blockedNamePatterns = [/wsl/i, /hyper-v/i, /virtual/i, /vmware/i, /docker/i, /bluetooth/i];

  const candidates = [];

  for (const [name, addresses] of Object.entries(interfaces)) {
    if (!addresses || blockedNamePatterns.some((pattern) => pattern.test(name))) {
      continue;
    }

    for (const addressInfo of addresses) {
      if (
        addressInfo.family === 'IPv4' &&
        !addressInfo.internal &&
        isPrivateIpv4(addressInfo.address)
      ) {
        candidates.push({
          name,
          address: addressInfo.address,
          preferred: preferredNamePatterns.some((pattern) => pattern.test(name)),
        });
      }
    }
  }

  const preferred = candidates.find((candidate) => candidate.preferred);
  return (preferred || candidates[0] || {}).address || null;
}

const lanIp = getPreferredLanIp();

if (!lanIp) {
  console.error('Could not determine a LAN IPv4 address for Expo.');
  process.exit(1);
}

const extraArgs = process.argv.slice(2);
const expoArgs = ['expo', 'start', '--host', 'lan', ...extraArgs];

console.log(`[start-expo] Using LAN IP: ${lanIp}`);

const child = spawn('npx', expoArgs, {
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
    EXPO_NO_DEPENDENCY_VALIDATION: 'true',
    EXPO_PACKAGER_PROXY_URL: `http://${lanIp}:8081`,
    REACT_NATIVE_PACKAGER_HOSTNAME: lanIp,
  },
});

child.on('exit', (code) => {
  process.exit(code ?? 0);
});
