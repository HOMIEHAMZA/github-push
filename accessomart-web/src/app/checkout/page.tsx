'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, CreditCard, ShieldCheck, Truck, Zap, CheckCircle2, MapPin, ChevronDown, ShoppingCart } from 'lucide-react';
import { useCartStore, CartItem } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useAddressStore } from '@/store/useAddressStore';
import { useToastStore } from '@/store/useToastStore';
import { ordersApi } from '@/lib/api-client';
import { ApiAddress } from '@/lib/api-types';

import { loadStripe } from '@stripe/stripe-js';
import { 
  Elements, 
  CardNumberElement, 
  CardExpiryElement, 
  CardCvcElement, 
  useStripe, 
  useElements 
} from '@stripe/react-stripe-js';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

type CheckoutStep = 'shipping' | 'payment' | 'review' | 'success';

const ELEMENT_OPTIONS = {
  style: {
    base: {
      color: '#ffffff',
      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
      fontSize: '16px',
      '::placeholder': {
        color: '#888888',
        textTransform: 'uppercase',
      },
    },
    invalid: {
      color: '#ef4444',
    },
  },
};

function CheckoutContent() {
  const stripe = useStripe();
  const elements = useElements();
  const { items, clearCart } = useCartStore();
  const { user, isAuthenticated } = useAuthStore();
  const { addresses, fetchAddresses } = useAddressStore();
  const { addToast } = useToastStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isAuthenticated) {
      fetchAddresses();
    }
  }, [isAuthenticated, fetchAddresses]);

  const [step, setStep] = useState<CheckoutStep>('shipping');
  const [loading, setLoading] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string>('');
  const [showSavedAddresses, setShowSavedAddresses] = useState(false);
  const [paymentProvider, setPaymentProvider] = useState<'STRIPE' | 'PAYPAL'>('STRIPE');
  const [internalOrderId, setInternalOrderId] = useState<string | null>(null);
  const [purchasedItems, setPurchasedItems] = useState<CartItem[]>([]);
  const [successMetrics, setSuccessMetrics] = useState({ subtotal: 0, tax: 0, shipping: 0, total: 0 });
  
  const [formData, setFormData] = useState({
    email: user?.email || '',
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'US',
    phone: '',
    cardName: '',
  });

  const subtotal = items.reduce((total, item) => {
    return total + ((item.price || 0) * item.quantity);
  }, 0);

  const shipping = subtotal > 500 ? 0 : 25;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const selectSavedAddress = (addr: ApiAddress) => {
    setFormData({
      ...formData,
      firstName: addr.firstName,
      lastName: addr.lastName,
      address: addr.line1 + (addr.line2 ? `, ${addr.line2}` : ''),
      city: addr.city,
      state: addr.state,
      postalCode: addr.postalCode,
      country: addr.country,
      phone: addr.phone || '',
    });
    setShowSavedAddresses(false);
  };

  const nextStep = async () => {
    if (step === 'shipping') setStep('payment');
    else if (step === 'payment') {
      if (!stripe || !elements) return;
      setStep('review');
    } else if (step === 'review') {
      if (paymentProvider === 'STRIPE') {
        if (!stripe || !elements) return;
        try {
          setLoading(true);
          const res = await ordersApi.checkout({
            addressData: {
              firstName: formData.firstName,
              lastName: formData.lastName,
              email: formData.email,
              address: formData.address,
              city: formData.city,
              postalCode: formData.postalCode,
              country: formData.country,
            },
            paymentProvider: 'STRIPE',
          });

          if (!res.clientSecret || !res.order?.id) {
              throw new Error('Failed to initialize secure connection with payment provider.');
          }

          const cardElement = elements.getElement(CardNumberElement);
          if (!cardElement) throw new Error('Card Element disconnected.');

          const confirmRes = await stripe.confirmCardPayment(res.clientSecret, {
              payment_method: {
                  card: cardElement,
                  billing_details: {
                      name: formData.cardName,
                      email: formData.email,
                      address: {
                          line1: formData.address,
                          city: formData.city,
                          postal_code: formData.postalCode,
                          country: formData.country,
                      }
                  }
              }
          });

          if (confirmRes.error) {
              throw new Error(confirmRes.error.message || 'Payment verification failed.');
          }

          await ordersApi.confirmPayment(res.order.id);

          setPurchasedItems([...items]);
          setSuccessMetrics({ subtotal, tax, shipping, total });
          setOrderNumber(res.order.orderNumber);
          clearCart();
          setStep('success');
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : 'Failed to initiate deployment.';
          addToast(message, 'error');
        } finally {
          setLoading(false);
        }
      } else {
        alert("Please use the PayPal button below to complete your transaction.");
      }
    }
  };

  const handlePayPalCreateOrder = async () => {
    try {
      const res = await ordersApi.checkout({
        addressData: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          address: formData.address,
          city: formData.city,
          postalCode: formData.postalCode,
          country: formData.country,
        },
        paymentProvider: 'PAYPAL',
      });
      
      if (!res.clientSecret || !res.order?.id) throw new Error('Failed to create PayPal order.');
      
      setInternalOrderId(res.order.id);
      setOrderNumber(res.order.orderNumber);
      
      return res.clientSecret;
    } catch (err: unknown) {
      console.error('PayPal createOrder error:', err);
      const message = err instanceof Error ? err.message : 'Failed to initiate PayPal deployment.';
      addToast(message, 'error');
      throw err;
    }
  };

  const handlePayPalApprove = async (paypalOrderId: string) => {
    try {
      if (!internalOrderId) throw new Error('No internal order sequence identified.');
      setLoading(true);
      
      await ordersApi.confirmPaypalPayment(internalOrderId, paypalOrderId);
      
      setPurchasedItems([...items]);
      setSuccessMetrics({ subtotal, tax, shipping, total });
      clearCart();
      setStep('success');
    } catch (err: unknown) {
       console.error('PayPal Approve Error:', err);
       const message = err instanceof Error ? err.message : 'PayPal capture failed. Please contact support if your account was debited.';
       addToast(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const prevStep = () => {
    if (step === 'payment') setStep('shipping');
    else if (step === 'review') setStep('payment');
  };

  if (!mounted) return null;

  if (items.length === 0 && step !== 'success') {
    return (
      <div className="container mx-auto px-6 py-20 min-h-[70vh] flex flex-col items-center justify-center text-center">
        <div className="w-24 h-24 mb-6 bg-surface-container-highest/20 rounded-full flex items-center justify-center">
          <ShoppingCart size={36} className="text-on-surface-variant opacity-50" />
        </div>
        <h1 className="text-3xl font-display font-bold text-on-surface mb-2">NO PAYLOAD DETECTED</h1>
        <p className="text-on-surface-variant mb-8 max-w-sm text-sm">
          Your inventory is empty. Please secure physical components from our catalog before initiating a checkout sequence.
        </p>
        <Link 
          href="/"
          className="bg-primary text-on-primary px-8 py-4 rounded-xl font-bold tracking-[0.2em] uppercase text-xs shadow-[0_0_20px_rgba(143,245,255,0.2)] hover:shadow-[0_0_30px_rgba(143,245,255,0.4)] transition-all"
        >
          RETURN TO NEXUS
        </Link>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div className="container mx-auto px-6 py-20 min-h-[70vh] flex flex-col items-center justify-center text-center">
        <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-surface-container-low p-12 rounded-3xl border border-primary/20 shadow-[0_0_50px_rgba(143,245,255,0.1)] max-w-lg space-y-8"
        >
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="text-primary" size={48} />
            </div>
            <div className="space-y-4 w-full">
                <h1 className="text-4xl font-display font-bold text-on-surface">CALIBRATION COMPLETE</h1>
                <p className="text-on-surface-variant leading-relaxed uppercase text-xs tracking-widest font-bold mb-6">
                    Order #{orderNumber || 'ACC-8023-99X'}
                </p>
                
                <div className="bg-black/30 border border-white/10 rounded-xl p-4 mb-6 text-left w-full h-[250px] overflow-y-auto">
                    <h3 className="text-xs uppercase tracking-widest text-primary mb-3 font-bold">Encrypted Manifest</h3>
                    <div className="space-y-3">
                        {purchasedItems.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-start text-sm border-b border-white/5 pb-2">
                                <div>
                                    <p className="font-bold text-white uppercase">{item.name}</p>
                                    <p className="text-xs text-zinc-500 uppercase tracking-tighter">
                                      {item.color || item.model || item.size ? [item.color, item.model, item.size].filter(Boolean).join(' • ') : 'Standard Configuration'}
                                    </p>
                                    <p className="text-[10px] text-zinc-600 mt-1">QTY: {item.quantity}</p>
                                </div>
                                <p className="font-machine text-primary font-bold">${Number(item.price * item.quantity).toFixed(2)}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-left border border-white/5 p-4 rounded-xl bg-surface-container-highest/10">
                    <div>
                      <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest leading-none mb-1">Financial Summary</p>
                      <div className="text-xs text-zinc-400 space-y-1">
                        <div className="flex justify-between"><span>Subtotal:</span> <span>${successMetrics.subtotal.toFixed(2)}</span></div>
                        <div className="flex justify-between"><span>Tax:</span> <span>${successMetrics.tax.toFixed(2)}</span></div>
                        <div className="flex justify-between"><span>Shipping:</span> <span>${successMetrics.shipping.toFixed(2)}</span></div>
                        <div className="flex justify-between text-white font-bold mt-1 pt-1 border-t border-white/10">
                           <span>Total:</span> <span className="text-primary">${successMetrics.total.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest leading-none mb-1">Payment Status</p>
                      <div className="flex items-center gap-2 mt-2">
                        <ShieldCheck className="text-emerald-500 w-4 h-4" />
                        <span className="text-xs font-bold text-white uppercase tracking-tighter">Authorized ({paymentProvider})</span>
                      </div>
                    </div>
                </div>

                <p className="text-on-surface-variant leading-relaxed text-sm">
                    Your deployment has been initiated. A detailed transmission packet (receipt) has been sent to your primary terminal.
                </p>
            </div>
            <Link
                href="/"
                className="inline-flex items-center gap-2 bg-primary text-on-primary px-10 py-5 rounded-xl font-bold tracking-[0.2em] uppercase text-sm hover:shadow-[0_0_30px_rgba(143,245,255,0.4)] transition-all"
            >
                RETURN TO NEXUS
                <ArrowRight size={18} />
            </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="flex flex-col gap-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div>
            <Link href="/cart" className="inline-flex items-center gap-2 text-sm text-primary font-bold tracking-widest uppercase mb-4 hover:opacity-70 transition-opacity">
              <ArrowLeft size={16} />
              Return to Cart
            </Link>
            <h1 className="text-4xl font-display font-bold text-on-surface tracking-tight uppercase">Checkout Terminal</h1>
          </div>
          
          <div className="flex items-center gap-4">
            {(['shipping', 'payment', 'review'] as const).map((s, idx) => (
              <React.Fragment key={s}>
                <div className="flex items-center gap-2">
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all
                    ${step === s ? 'bg-primary text-on-primary shadow-[0_0_15px_rgba(143,245,255,0.4)]' : 
                      idx < ['shipping', 'payment', 'review'].indexOf(step) ? 'bg-primary/20 text-primary' : 'bg-surface-container-highest/20 text-on-surface-variant'}
                  `}>
                    {idx + 1}
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-widest hidden sm:block ${step === s ? 'text-primary' : 'text-on-surface-variant'}`}>
                    {s}
                  </span>
                </div>
                {idx < 2 && <div className="w-8 h-px bg-surface-container-highest/10" />}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-7 space-y-8">
            <AnimatePresence mode="wait">
              {step === 'shipping' && (
                <motion.div
                  key="shipping"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-8 pb-12"
                >
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-bold text-on-surface flex items-center gap-3">
                        <Truck className="text-primary" size={24} />
                        Deployment Destination
                      </h2>

                      {isAuthenticated && addresses.length > 0 && (
                        <div className="relative">
                          <button 
                            onClick={() => setShowSavedAddresses(!showSavedAddresses)}
                            className="flex items-center space-x-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-lg text-[10px] font-bold text-primary uppercase tracking-widest hover:bg-primary/20 transition-all"
                          >
                            <MapPin size={12} />
                            <span>Saved Addresses</span>
                            <ChevronDown size={12} className={`transition-transform ${showSavedAddresses ? 'rotate-180' : ''}`} />
                          </button>

                          <AnimatePresence>
                            {showSavedAddresses && (
                              <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="absolute right-0 mt-2 w-72 bg-[#111] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden"
                              >
                                <div className="max-h-64 overflow-y-auto p-2 space-y-1">
                                  {addresses.map((addr) => (
                                    <button
                                      key={addr.id}
                                      onClick={() => selectSavedAddress(addr)}
                                      className="w-full text-left p-3 hover:bg-white/5 rounded-lg transition-colors group"
                                    >
                                      <p className="text-xs font-bold text-white group-hover:text-primary">{addr.label}</p>
                                      <p className="text-[10px] text-white/40 truncate">{addr.line1}, {addr.city}</p>
                                    </button>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest px-1">First Name</label>
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          autoComplete="given-name"
                          className="w-full bg-surface-container-highest/10 border border-surface-container-highest/20 rounded-xl px-4 py-4 text-on-surface focus:outline-none focus:border-primary/50 transition-all"
                          placeholder="John"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest px-1">Last Name</label>
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          autoComplete="family-name"
                          className="w-full bg-surface-container-highest/10 border border-surface-container-highest/20 rounded-xl px-4 py-4 text-on-surface focus:outline-none focus:border-primary/50 transition-all"
                          placeholder="Wick"
                        />
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest px-1">Email Terminal</label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          autoComplete="email"
                          className="w-full bg-surface-container-highest/10 border border-surface-container-highest/20 rounded-xl px-4 py-4 text-on-surface focus:outline-none focus:border-primary/50 transition-all"
                          placeholder="j.wick@continental.com"
                        />
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest px-1">Full Logistics Address</label>
                        <input
                          type="text"
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          autoComplete="street-address"
                          className="w-full bg-surface-container-highest/10 border border-surface-container-highest/20 rounded-xl px-4 py-4 text-on-surface focus:outline-none focus:border-primary/50 transition-all"
                          placeholder="123 Neon Circuit, Suite 404"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest px-1">City</label>
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          autoComplete="address-level2"
                          className="w-full bg-surface-container-highest/10 border border-surface-container-highest/20 rounded-xl px-4 py-4 text-on-surface focus:outline-none focus:border-primary/50 transition-all"
                          placeholder="Night City"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest px-1">Postal Code</label>
                        <input
                          type="text"
                          name="postalCode"
                          value={formData.postalCode}
                          onChange={handleInputChange}
                          autoComplete="postal-code"
                          className="w-full bg-surface-container-highest/10 border border-surface-container-highest/20 rounded-xl px-4 py-4 text-on-surface focus:outline-none focus:border-primary/50 transition-all"
                          placeholder="90210"
                        />
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={nextStep}
                    className="w-full flex items-center justify-center gap-2 bg-primary text-on-primary py-5 rounded-xl font-bold tracking-[0.2em] uppercase text-sm shadow-[0_0_20px_rgba(143,245,255,0.2)] hover:shadow-[0_0_30px_rgba(143,245,255,0.3)] transition-all"
                  >
                    CONTINUE TO PAYMENT
                    <ArrowRight size={18} />
                  </button>
                </motion.div>
              )}

              </div>

              <div className={step === 'payment' ? 'block' : 'hidden'}>
                <motion.div
                  key="payment"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-8 pb-12"
                >
                  <div className="space-y-6">
                    <h2 className="text-xl font-bold text-on-surface flex items-center gap-3">
                      <CreditCard className="text-primary" size={24} />
                      Financial Calibration
                    </h2>
                    
                    <div className="bg-surface-container-highest/5 border border-surface-container-highest/20 rounded-2xl p-6 space-y-8">
                       <div className="space-y-4">
                          <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest px-1">Select Payment Protocol</label>
                          <div className="grid grid-cols-2 gap-4">
                             <button
                               onClick={() => setPaymentProvider('STRIPE')}
                               className={`flex flex-col items-center justify-center gap-3 p-4 rounded-xl border transition-all ${paymentProvider === 'STRIPE' ? 'bg-primary/10 border-primary text-primary shadow-[0_0_15px_rgba(143,245,255,0.2)]' : 'bg-surface-container-highest/5 border-surface-container-highest/20 text-on-surface-variant'}`}
                             >
                               <CreditCard size={24} />
                               <span className="text-[10px] font-bold uppercase tracking-widest">Stripe Core</span>
                             </button>
                             <button
                               onClick={() => setPaymentProvider('PAYPAL')}
                               className={`flex flex-col items-center justify-center gap-3 p-4 rounded-xl border transition-all ${paymentProvider === 'PAYPAL' ? 'bg-primary/10 border-primary text-primary shadow-[0_0_15px_rgba(143,245,255,0.2)]' : 'bg-surface-container-highest/5 border-surface-container-highest/20 text-on-surface-variant'}`}
                             >
                               <div className="w-6 h-6 flex items-center justify-center">
                                  <svg viewBox="0 0 24 24" className="fill-current" width="24" height="24">
                                     <path d="M7.076 21.337H2.47a.641.641 0 01-.633-.74L4.944 3.328a.915.915 0 01.906-.77H14.3c4.702 0 7.278 2.313 7.278 6.19 0 1.547-.417 2.946-1.127 4.103-1.077 1.754-2.825 2.87-4.996 2.87h-.795a.862.862 0 00-.776.518l-.512 1.341c-.427 1.134-1.396 3.737-1.396 3.737a.637.637 0 01-.64.44H7.076z" />
                                  </svg>
                               </div>
                               <span className="text-[10px] font-bold uppercase tracking-widest">PayPal Link</span>
                             </button>
                          </div>
                       </div>

                       {paymentProvider === 'STRIPE' ? (
                        <div className="space-y-6 pt-4 border-t border-surface-container-highest/10">
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest px-1">Name on Neural Link Card</label>
                            <input
                              type="text"
                              name="cardName"
                              value={formData.cardName}
                              onChange={handleInputChange}
                              className="w-full bg-surface-container-highest/10 border border-surface-container-highest/20 rounded-xl px-4 py-4 text-on-surface focus:outline-none focus:border-primary/50 transition-all"
                              placeholder="JOHN WICK"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest px-1">Card Number</label>
                            <div className="w-full bg-surface-container-highest/10 border border-surface-container-highest/20 rounded-xl px-4 py-4 transition-all focus-within:border-primary/50">
                              <CardNumberElement options={ELEMENT_OPTIONS} />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest px-1">Expiry Date</label>
                              <div className="w-full bg-surface-container-highest/10 border border-surface-container-highest/20 rounded-xl px-4 py-4 transition-all focus-within:border-primary/50">
                                <CardExpiryElement options={ELEMENT_OPTIONS} />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest px-1">CVV</label>
                              <div className="w-full bg-surface-container-highest/10 border border-surface-container-highest/20 rounded-xl px-4 py-4 transition-all focus-within:border-primary/50">
                                <CardCvcElement options={ELEMENT_OPTIONS} />
                              </div>
                            </div>
                          </div>
                        </div>
                       ) : (
                         <div className="space-y-6 pt-4 border-t border-surface-container-highest/10 animate-pulse">
                            <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl text-center space-y-2">
                               <p className="text-[10px] font-bold text-primary uppercase tracking-widest">PayPal Protocol Active</p>
                               <p className="text-[10px] text-on-surface-variant uppercase tracking-[0.05em]">Order confirmation will occur in the subsequent step.</p>
                            </div>
                         </div>
                       )}
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <button
                      onClick={prevStep}
                      className="flex-1 bg-surface-container-highest/20 text-on-surface py-5 rounded-xl font-bold tracking-[0.2em] uppercase text-sm hover:bg-surface-container-highest/30 transition-all"
                    >
                      BACK
                    </button>
                    <button
                      onClick={nextStep}
                      className="flex-2 flex items-center justify-center gap-2 bg-primary text-on-primary py-5 rounded-xl font-bold tracking-[0.2em] uppercase text-sm shadow-[0_0_20px_rgba(143,245,255,0.2)] hover:shadow-[0_0_30px_rgba(143,245,255,0.3)] transition-all"
                    >
                      REVIEW ORDER
                      <ArrowRight size={18} />
                    </button>
                  </div>
                </motion.div>
              </div>

              <div style={{ display: 'none' }}>

              {step === 'review' && (
                <motion.div
                  key="review"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-8 pb-12"
                >
                  <div className="space-y-6">
                    <h2 className="text-xl font-bold text-on-surface flex items-center gap-3">
                      <Zap className="text-primary" size={24} />
                      Final Transmission Audit
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-surface-container-low border border-surface-container-highest/10 rounded-2xl p-6 space-y-4">
                        <div className="flex justify-between items-start">
                           <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-[0.2em]">Deployment Destination</h3>
                           <button onClick={() => setStep('shipping')} className="text-[10px] text-primary font-bold uppercase tracking-widest hover:underline">Edit</button>
                        </div>
                        <div className="text-sm text-on-surface space-y-1">
                          <p>{formData.firstName} {formData.lastName}</p>
                          <p className="opacity-70">{formData.address}</p>
                          <p className="opacity-70">{formData.city}, {formData.postalCode}</p>
                        </div>
                      </div>

                      <div className="bg-surface-container-low border border-surface-container-highest/10 rounded-2xl p-6 space-y-4">
                        <div className="flex justify-between items-start">
                           <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-[0.2em]">Financial Details</h3>
                           <button onClick={() => setStep('payment')} className="text-[10px] text-primary font-bold uppercase tracking-widest hover:underline">Edit</button>
                        </div>
                        <div className="text-sm text-on-surface space-y-1">
                          <p className="opacity-70 uppercase">{paymentProvider === 'STRIPE' ? formData.cardName : 'PayPal Authorized'}</p>
                          <p className="text-xs text-on-surface-variant mt-2">
                             {paymentProvider === 'STRIPE' ? 'Card details securely staged via Stripe.' : 'PayPal account link verified.'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-4">
                    {paymentProvider === 'PAYPAL' && (
                      <div className="w-full overflow-hidden rounded-xl border border-primary/20 p-4 bg-black/40">
                         <PayPalButtons 
                           style={{ layout: 'vertical', color: 'blue', shape: 'rect', label: 'pay' }}
                           createOrder={async () => {
                             const paypalId = await handlePayPalCreateOrder();
                             return paypalId;
                           }}
                           onApprove={async (data) => {
                             if (data.orderID) {
                               await handlePayPalApprove(data.orderID);
                             }
                           }}
                         />
                      </div>
                    )}
                    
                    <div className="flex gap-4">
                      <button
                        onClick={prevStep}
                        className="flex-1 bg-surface-container-highest/20 text-on-surface py-5 rounded-xl font-bold tracking-[0.2em] uppercase text-sm hover:bg-surface-container-highest/30 transition-all"
                      >
                        BACK
                      </button>
                      {paymentProvider === 'STRIPE' && (
                        <button
                          onClick={nextStep}
                          disabled={loading || !stripe}
                          className="flex-2 flex items-center justify-center gap-2 bg-primary text-on-primary py-5 rounded-xl font-bold tracking-[0.2em] uppercase text-sm shadow-[0_0_30px_rgba(143,245,255,0.3)] hover:shadow-[0_0_40px_rgba(143,245,255,0.5)] transition-all animate-pulse disabled:opacity-50 disabled:animate-none"
                        >
                          {loading ? 'PROCESSING...' : 'INITIATE DEPLOYMENT'}
                          {!loading && <Zap size={18} />}
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sidebar Area: Order Summary */}
          <div className="lg:col-span-5 space-y-8">
            <div className="p-8 rounded-2xl bg-surface-container-low border border-surface-container-highest/10 shadow-xl space-y-8 sticky top-40">
              <h2 className="text-lg font-bold text-on-surface tracking-tight border-b border-surface-container-highest/10 pb-4">
                PACKET INVENTORY ({items.length})
              </h2>

              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {items.map((item) => {
                  const name = item.isCustomBuild ? item.buildName : item.name;
                  const brand = item.isCustomBuild ? "Custom Build" : item.brand;
                  const price = item.price;
                  const image = item.isCustomBuild ? "/images/components/case.png" : (item.imageUrl || "/placeholder.png");
                  
                  return (
                    <div key={item.id} className="flex gap-4 items-center">
                      <div className="w-16 h-16 bg-surface-container-highest/20 rounded-lg overflow-hidden shrink-0 relative border border-white/5">
                        <Image src={image} alt={name || ""} fill className="object-cover opacity-80" />
                        <div className="absolute top-0 right-0 bg-primary/20 backdrop-blur-md text-primary text-[10px] font-bold px-1.5 py-0.5 rounded-bl-lg">
                          x{item.quantity}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-on-surface truncate">{name}</h4>
                        <p className="text-[10px] text-on-surface-variant uppercase tracking-widest leading-none mt-1">{brand}</p>
                      </div>
                      <span className="font-mono text-xs text-on-surface">${((price || 0) * item.quantity).toFixed(2)}</span>
                    </div>
                  );
                })}
              </div>

              <div className="space-y-4 pt-4 border-t border-surface-container-highest/10">
                <div className="flex justify-between text-on-surface-variant text-sm">
                  <span>Subtotal</span>
                  <span className="font-mono">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-on-surface-variant text-sm">
                  <span>Logistics Protocol</span>
                  <span className="font-mono text-primary">{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between text-on-surface-variant text-sm">
                  <span>Regulatory Tax</span>
                  <span className="font-mono">${tax.toFixed(2)}</span>
                </div>
                <div className="pt-4 border-t border-surface-container-highest/10 flex justify-between items-end">
                  <span className="text-lg font-bold text-on-surface">GRAND TOTAL</span>
                  <span className="text-2xl font-bold text-primary font-mono">${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Guarantees */}
              <div className="flex flex-col gap-3 pt-6 border-t border-surface-container-highest/10">
                <div className="flex items-center gap-3 text-[10px] text-on-surface-variant font-bold uppercase tracking-widest opacity-60">
                  <ShieldCheck size={14} className="text-primary" />
                  AES-256 Bit Encryption Active
                </div>
                <div className="flex items-center gap-3 text-[10px] text-on-surface-variant font-bold uppercase tracking-widest opacity-60">
                  <Zap size={14} className="text-primary" />
                  Real-time State Sync Verified (Stripe)
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <PayPalScriptProvider options={{ 
      clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "test",
      currency: "USD",
      intent: "capture"
    }}>
      <Elements stripe={stripePromise}>
        <CheckoutContent />
      </Elements>
    </PayPalScriptProvider>
  );
}
