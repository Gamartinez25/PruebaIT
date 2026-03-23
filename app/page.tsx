'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from '@/components/ui/select'
import { ArrowLeft, Heart, Users, Zap, CheckCircle, Loader,AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default function StreamerPaymentPage() {
  const [amount, setAmount] = useState('5.00')
  const [selectedTier, setSelectedTier] = useState('tier-1')
  const [cardNumber, setCardNumber] = useState('')
  const [cardholderName, setCardholderName] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [cvv, setCvv] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [transactionId, setTransactionId] = useState('')
const [statusMsg, setStatusMsg] = useState({ type: '', text: '' })
  const tiers = {
    'tier-1': { name: 'Coffee ☕', amount: '5.00', description: 'Buy a coffee' },
    'tier-2': { name: 'Lunch 🍕', amount: '15.00', description: 'Fund a lunch' },
    'tier-3': { name: 'Gaming PC 🖥️', amount: '50.00', description: 'Boost the setup' },
    'tier-custom': { name: 'Custom Amount', amount: amount, description: 'Your choice' }
  }

  const currentTier = tiers[selectedTier as keyof typeof tiers]

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    const matches = v.match(/\d{4,16}/g)
    const match = (matches && matches[0]) || ''
    const parts = []
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }
    return parts.length ? parts.join(' ') : value
  }

  const handlePayment = async () => {
    setIsProcessing(true)
const baseAmount = parseFloat(amount || '0');
const totalInDollars = Math.round((baseAmount + (baseAmount * 0.029) + 0.30) * 100) / 100;    console.log((totalInDollars*100))
  // 2. Convertimos a centavos de forma segura (redondeando a entero)
  const amountInCents = Math.round(totalInDollars * 100); 
  try {
      const response = await fetch('https://icsox6x2u3.execute-api.us-east-2.amazonaws.com/dev/wallet/webhook/lithic', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event_type: "card_authorization.approval_request",
          token: "12345",
          card_token: "364c3dd0-a211-4a97-b2f9-bdf725502b06",
          amount: amountInCents,
          merchant: {
            descriptor: "StreamerPay",
            city: "a",
            state: "a",
            country: "USA"
          },
          status: "AUTHORIZATION"
        })
      });
      if (!response.ok) {
        throw new Error('Error en el procesamiento del pago');
      }
      
      // Si necesitas la respuesta del servidor, puedes extraerla así:
      // const data = await response.json();

      // Generar ID de transacción
      const txId = 'TXN-' + Math.random().toString(36).substr(2, 9).toUpperCase()
      setTransactionId(txId)
      setPaymentSuccess(true)
      setStatusMsg({ type: 'success', text: '¡Pago procesado correctamente!' })
    } catch (error) {
      console.error('Hubo un error al procesar el pago:', error)
      setStatusMsg({ type: 'error', text: 'Hubo un problema al procesar tu tarjeta. Por favor, intenta de nuevo.' })
      // Aquí podrías agregar lógica para mostrar un mensaje de error al usuario
    } finally {
      setIsProcessing(false)
    }
  }

  const resetForm = () => {
    setPaymentSuccess(false)
    setAmount('5.00')
    setSelectedTier('tier-1')
    setCardNumber('')
    setCardholderName('')
    setExpiryDate('')
    setCvv('')
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Payment Success Modal */}
      {paymentSuccess && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border/50 rounded-2xl p-8 max-w-md w-full space-y-6 animate-in fade-in scale-95">
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-accent/20 rounded-full blur-xl animate-pulse" />
                <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-background" />
                </div>
              </div>
            </div>

            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Payment Successful!</h2>
              <p className="text-foreground/60">Your support has been received</p>
            </div>

            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-foreground/60">Amount</span>
                <span className="font-semibold text-accent">${parseFloat(amount || '0').toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-foreground/60">Transaction ID</span>
                <span className="font-mono text-xs text-foreground/70">{transactionId}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-foreground/60">Recipient</span>
                <span className="font-semibold">@streamer_name</span>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-foreground/60 text-center">
                Your donation will appear in the stream chat instantly. Thank you for your support!
              </p>
              <p className="text-xs text-foreground/40 text-center">
                A receipt has been sent to your email
              </p>
            </div>

            <div className="space-y-3 pt-6 border-t border-border/50">
              <Button
                onClick={resetForm}
                className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-accent-foreground font-semibold"
              >
                Support Again
              </Button>
              <Button
                variant="outline"
                className="w-full border-border/50 hover:bg-card/80"
              >
                Back to Channel
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm bg-background/80">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold">StreamerPay</span>
          </div>
          <nav className="flex items-center gap-6 text-sm">
            <button className="text-foreground/70 hover:text-foreground transition">About</button>
            <button className="text-foreground/70 hover:text-foreground transition">FAQ</button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid lg:grid-cols-2 gap-16 max-w-6xl">
          {/* Left Side - Streamer Info */}
          <div className="flex flex-col justify-center space-y-8">
            <div>
              <Link href="#" className="inline-flex items-center gap-2 text-primary hover:text-accent transition mb-8">
                <ArrowLeft className="w-4 h-4" />
                <span>Back to channel</span>
              </Link>
            </div>

            <div>
              <h1 className="text-4xl font-bold mb-2">
                Support <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">@streamer_name</span>
              </h1>
              <p className="text-foreground/60 text-lg">Help fuel epic gaming sessions and content creation</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="mt-1">
                  <Heart className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Direct Support</h3>
                  <p className="text-foreground/60 text-sm">100% of your donation goes directly to the streamer</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="mt-1">
                  <Users className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Community Impact</h3>
                  <p className="text-foreground/60 text-sm">Join thousands of supporters funding amazing content</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="mt-1">
                  <Zap className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Instant Access</h3>
                  <p className="text-foreground/60 text-sm">Your donation appears in chat immediately</p>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-border/50">
              <p className="text-foreground/50 text-sm">
                <span className="font-semibold text-foreground/70">💜 Supported by 12,847</span> creators and counting
              </p>
            </div>
          </div>

          {/* Right Side - Payment Form */}
          <div className="lg:sticky lg:top-8 lg:h-fit">
            <div className="bg-card border border-border/50 rounded-2xl p-8 space-y-8 backdrop-blur-sm">
              {/* Amount Selection */}
              <div className="space-y-4">
                <label className="block text-sm font-semibold">Choose Amount</label>
                <div className="grid grid-cols-3 gap-3">
                  {Object.entries(tiers).map(([key, tier]) => (
                    key !== 'tier-custom' && (
                      <button
                        key={key}
                        onClick={() => {
                          setSelectedTier(key)
                          setAmount(tier.amount)
                        }}
                        className={`p-3 rounded-lg border-2 transition-all font-semibold text-sm ${
                          selectedTier === key
                            ? 'border-accent bg-accent/10 text-accent'
                            : 'border-border text-foreground hover:border-accent/50'
                        }`}
                      >
                        ${tier.amount}
                      </button>
                    )
                  ))}
                </div>
              </div>

              {/* Custom Amount */}
              <div className="space-y-3">
                <label htmlFor="custom-amount" className="block text-sm font-semibold">
                  Or enter custom amount
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/50">$</span>
                  <Input
                    id="custom-amount"
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => {
                      setAmount(e.target.value)
                      setSelectedTier('tier-custom')
                    }}
                    className="pl-8 bg-input border-border/50 text-foreground placeholder:text-foreground/30"
                    step="0.01"
                    min="0.50"
                  />
                </div>
              </div>

              {/* Card Details */}
              <div className="space-y-4 pt-6 border-t border-border/50">
                <h3 className="font-semibold text-sm">Payment Method</h3>
                
                <div className="space-y-2">
                  <label htmlFor="card-number" className="text-xs font-semibold text-foreground/70">
                    Card Number
                  </label>
                  <Input
                    id="card-number"
                    placeholder="1234 1234 1234 1234"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                    maxLength={19}
                    className="bg-input border-border/50 text-foreground placeholder:text-foreground/30 font-mono"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="cardholder" className="text-xs font-semibold text-foreground/70">
                    Cardholder Name
                  </label>
                  <Input
                    id="cardholder"
                    placeholder="Your Name"
                    value={cardholderName}
                    onChange={(e) => setCardholderName(e.target.value)}
                    className="bg-input border-border/50 text-foreground placeholder:text-foreground/30"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label htmlFor="expiry" className="text-xs font-semibold text-foreground/70">
                      Expiry Date
                    </label>
                    <Input
                      id="expiry"
                      placeholder="MM/YY"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                      maxLength={5}
                      className="bg-input border-border/50 text-foreground placeholder:text-foreground/30"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="cvv" className="text-xs font-semibold text-foreground/70">
                      CVV
                    </label>
                    <Input
                      id="cvv"
                      placeholder="123"
                      type="password"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value.slice(0, 4))}
                      maxLength={4}
                      className="bg-input border-border/50 text-foreground placeholder:text-foreground/30"
                    />
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="space-y-3 pt-6 border-t border-border/50">
                <div className="flex justify-between text-sm">
                  <span className="text-foreground/60">Amount</span>
                  <span className="font-semibold">${parseFloat(amount || '0').toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-foreground/60">Processing Fee</span>
                  <span className="font-semibold">${(parseFloat(amount || '0') * 0.029 + 0.30).toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-border/50">
                  <span className="font-semibold">Total</span>
                  <span className="text-lg font-bold text-accent">${(parseFloat(amount || '0') + parseFloat(amount || '0') * 0.029 + 0.30).toFixed(2)}</span>
                </div>
              </div>
             {/* NUEVO: Contenedor del mensaje de Éxito / Error en línea */}
              {statusMsg.text && (
                <div className={`p-4 rounded-lg flex items-start gap-3 text-sm font-medium ${
                  statusMsg.type === 'success' 
                    ? 'bg-green-500/10 text-green-600 border border-green-500/20' 
                    : 'bg-red-500/10 text-red-600 border border-red-500/20'
                }`}>
                  {statusMsg.type === 'success' ? (
                    <CheckCircle className="w-5 h-5 shrink-0" />
                  ) : (
                    <AlertCircle className="w-5 h-5 shrink-0" />
                  )}
                  <p>{statusMsg.text}</p>
                </div>
              )}
              {/* Submit Button */}
              <Button
                onClick={handlePayment}
                disabled={isProcessing}
                className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-accent-foreground font-semibold py-6 rounded-lg text-base transition-all hover:shadow-lg hover:shadow-accent/20 disabled:opacity-70"
              >
                {isProcessing ? (
                  <>
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Heart className="w-4 h-4 mr-2" />
                    Support ${parseFloat(amount || '0').toFixed(2)}
                  </>
                )}
              </Button>

              <p className="text-xs text-foreground/40 text-center">
                Secure payment powered by Stripe. Your information is encrypted.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-card/30 mt-32">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <h4 className="font-semibold mb-4">StreamerPay</h4>
              <p className="text-foreground/60 text-sm">Support creators you love</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm">Product</h4>
              <ul className="space-y-2 text-sm text-foreground/60">
                <li><a href="#" className="hover:text-foreground transition">Features</a></li>
                <li><a href="#" className="hover:text-foreground transition">Pricing</a></li>
                <li><a href="#" className="hover:text-foreground transition">Security</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm">Company</h4>
              <ul className="space-y-2 text-sm text-foreground/60">
                <li><a href="#" className="hover:text-foreground transition">About</a></li>
                <li><a href="#" className="hover:text-foreground transition">Blog</a></li>
                <li><a href="#" className="hover:text-foreground transition">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm">Legal</h4>
              <ul className="space-y-2 text-sm text-foreground/60">
                <li><a href="#" className="hover:text-foreground transition">Privacy</a></li>
                <li><a href="#" className="hover:text-foreground transition">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border/50 pt-8 flex justify-between items-center text-sm text-foreground/50">
            <p>&copy; 2024 StreamerPay. All rights reserved.</p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-foreground transition">Twitter</a>
              <a href="#" className="hover:text-foreground transition">Discord</a>
              <a href="#" className="hover:text-foreground transition">YouTube</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}