import { useState } from 'react';
import { Alert, Platform } from 'react-native';
import RazorpayCheckout from 'react-native-razorpay';
import { apiFetch, setToken } from './useApi';
import * as SecureStore from 'expo-secure-store';

const USER_KEY = 'user_data';

export type PlanId = 'monthly' | 'quarterly' | 'yearly';

export interface Plan {
    id: PlanId;
    label: string;
    amount: number;
    currency: string;
    days: number;
}

export function usePayment() {
    const [isLoading, setIsLoading] = useState(false);

    const buyPremium = async (plan: PlanId = 'monthly') => {
        setIsLoading(true);
        try {
            const orderRes = await apiFetch<{
                id: string;
                amount: number;
                currency: string;
                key_id: string;
                plan: string;
            }>('/payment/create-order', {
                method: 'POST',
                body: JSON.stringify({ plan }),
                requiresAuth: true,
            });

            if (!orderRes.success || !orderRes.data) {
                Alert.alert('Error', 'Failed to create payment order. Please try again.');
                return false;
            }

            const { id: orderId, amount, currency, key_id } = orderRes.data;

            const options = {
                description: 'GetNotes Premium Subscription',
                image: 'https://getnotes.app/icon.png',
                currency,
                key: key_id,
                amount,
                order_id: orderId,
                name: 'GetNotes',
                prefill: {
                    email: '',
                    contact: '',
                    name: '',
                },
                theme: { color: '#7C3AED' },
                modal: {
                    ondismiss: () => {
                        setIsLoading(false);
                    },
                },
            };

            const paymentResult = await RazorpayCheckout.open(options);

            if (paymentResult) {
                const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = paymentResult;

                const verifyRes = await apiFetch<{
                    token: string;
                    user: any;
                }>('/payment/verify', {
                    method: 'POST',
                    body: JSON.stringify({
                        orderId: razorpay_order_id,
                        paymentId: razorpay_payment_id,
                        signature: razorpay_signature,
                    }),
                    requiresAuth: true,
                });

                if (verifyRes.success && verifyRes.data) {
                    await setToken(verifyRes.data.token);
                    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(verifyRes.data.user));
                    Alert.alert('Premium Activated!', 'You now have access to all premium features.');
                    return true;
                } else {
                    Alert.alert('Verification Failed', verifyRes.message || 'Could not verify payment.');
                    return false;
                }
            }
            return false;
        } catch (error: any) {
            if (error?.code === 2) {
                return false;
            }
            Alert.alert('Payment Error', error?.message || 'Something went wrong. Please try again.');
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const fetchPlans = async (): Promise<Plan[]> => {
        try {
            const res = await apiFetch<Plan[]>('/payment/plans', { requiresAuth: false });
            if (res.success && res.data) {
                return res.data;
            }
        } catch (err) {
            console.error('Fetch plans error:', err);
        }
        return [
            { id: 'monthly', label: 'Monthly', amount: 4900, currency: 'INR', days: 30 },
            { id: 'quarterly', label: 'Quarterly', amount: 12900, currency: 'INR', days: 90 },
            { id: 'yearly', label: 'Yearly', amount: 39900, currency: 'INR', days: 365 },
        ];
    };

    return { buyPremium, fetchPlans, isLoading };
}
