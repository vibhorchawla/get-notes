declare module 'react-native-razorpay' {
    interface RazorpayOptions {
        description?: string;
        image?: string;
        currency: string;
        key: string;
        amount: number;
        order_id: string;
        name: string;
        prefill?: { email?: string; contact?: string; name?: string };
        theme?: { color?: string };
        modal?: { ondismiss?: () => void };
    }

    interface RazorpayPaymentResult {
        razorpay_order_id: string;
        razorpay_payment_id: string;
        razorpay_signature: string;
    }

    interface RazorpayError {
        code: number;
        message: string;
        description: string;
    }

    const RazorpayCheckout: {
        open: (options: RazorpayOptions) => Promise<RazorpayPaymentResult>;
    };

    export default RazorpayCheckout;
}
