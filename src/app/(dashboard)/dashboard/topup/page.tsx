"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  CreditCard,
  Wallet,
  Gift,
  Crown,
  Check,
  Info,
  Loader2,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  Building,
  Smartphone,
  Copy,
} from "lucide-react";

interface CreditPackage {
  id: string;
  slug: string;
  name: string;
  credits: number;
  price: number;
  bonusCredits: number;
  savingsPercent: number | null;
  isPopular: boolean;
}

interface PaymentMethod {
  id: string;
  method: string;
  label: string;
  instructions: string;
  accountTitle: string | null;
  accountNumber: string | null;
  bankName: string | null;
  iban: string | null;
  mobileNumber: string | null;
}

interface TopUpRequest {
  id: string;
  requestNumber: string;
  credits: number;
  bonusCredits: number;
  amount: number;
  paymentMethod: string;
  status: string;
  createdAt: string;
  processedAt: string | null;
  rejectionReason: string | null;
  package: {
    name: string;
    credits: number;
    bonusCredits: number;
    price: number;
  } | null;
}

interface WalletData {
  fundingBalance: number;
  redeemBalance: number;
  totalCredits: number;
}

export default function TopUpPage() {
  const [packages, setPackages] = useState<CreditPackage[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [requests, setRequests] = useState<TopUpRequest[]>([]);
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Request dialog state
  const [selectedPackage, setSelectedPackage] = useState<CreditPackage | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Success dialog state
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [successData, setSuccessData] = useState<{
    requestNumber: string;
    paymentDetails: PaymentMethod | null;
  } | null>(null);

  // Cancel dialog state
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [requestToCancel, setRequestToCancel] = useState<TopUpRequest | null>(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [optionsRes, requestsRes, walletRes] = await Promise.all([
        fetch("/api/topup/options"),
        fetch("/api/topup"),
        fetch("/api/wallet/balance"),
      ]);

      if (!optionsRes.ok) throw new Error("Failed to fetch options");
      if (!requestsRes.ok) throw new Error("Failed to fetch requests");

      const optionsData = await optionsRes.json();
      const requestsData = await requestsRes.json();

      setPackages(optionsData.packages || []);
      setPaymentMethods(optionsData.paymentMethods || []);
      setRequests(requestsData.requests || []);

      if (walletRes.ok) {
        const walletDataRes = await walletRes.json();
        setWalletData(walletDataRes);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const openPurchaseDialog = (pkg: CreditPackage) => {
    setSelectedPackage(pkg);
    setSelectedMethod(null);
    setSubmitError(null);
    setDialogOpen(true);
  };

  const handleSubmitRequest = async () => {
    if (!selectedPackage || !selectedMethod) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch("/api/topup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packageId: selectedPackage.id,
          paymentMethod: selectedMethod.method,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create request");
      }

      // Success - show payment instructions
      setDialogOpen(false);
      setSuccessData({
        requestNumber: data.request.requestNumber,
        paymentDetails: data.paymentDetails,
      });
      setSuccessDialogOpen(true);

      // Refresh requests
      fetchData();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const openCancelDialog = (request: TopUpRequest) => {
    setRequestToCancel(request);
    setCancelDialogOpen(true);
  };

  const handleCancelRequest = async () => {
    if (!requestToCancel) return;

    setCancelling(true);

    try {
      const response = await fetch(`/api/topup/${requestToCancel.id}/cancel`, {
        method: "POST",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to cancel request");
      }

      setCancelDialogOpen(false);
      setRequestToCancel(null);
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setCancelling(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Badge variant="outline" className="text-yellow-600 border-yellow-300"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case "COMPLETED":
        return <Badge variant="outline" className="text-green-600 border-green-300"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>;
      case "REJECTED":
        return <Badge variant="outline" className="text-red-600 border-red-300"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      case "CANCELLED":
        return <Badge variant="secondary"><XCircle className="h-3 w-3 mr-1" />Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getMethodIcon = (method: string) => {
    if (method === "BANK_TRANSFER") return Building;
    if (method === "JAZZCASH" || method === "EASYPAISA") return Smartphone;
    return CreditCard;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={fetchData}>Try Again</Button>
        </div>
      </div>
    );
  }

  const pendingRequest = requests.find((r) => r.status === "PENDING");

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Top Up Credits</h1>
        <p className="text-gray-500 mt-1">
          Purchase credits to send interests, view contacts, and unlock premium features
        </p>
      </div>

      {/* Current Balance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Balance
            </CardTitle>
            <Wallet className="h-5 w-5 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {walletData?.totalCredits || 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">credits available</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Funding Wallet
            </CardTitle>
            <CreditCard className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {walletData?.fundingBalance || 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">purchased credits</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Redeem Wallet
            </CardTitle>
            <Gift className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {walletData?.redeemBalance || 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">free credits</p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Request Alert */}
      {pendingRequest && (
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-800">
                    You have a pending top-up request
                  </p>
                  <p className="text-sm text-yellow-700 mt-1">
                    Request #{pendingRequest.requestNumber} for{" "}
                    {pendingRequest.credits + pendingRequest.bonusCredits} credits ($
                    {Number(pendingRequest.amount).toFixed(2)})
                  </p>
                  <p className="text-xs text-yellow-600 mt-1">
                    Please complete your payment and wait for approval.
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => openCancelDialog(pendingRequest)}
              >
                Cancel Request
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info Banner */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-blue-800">How it works</p>
              <ol className="text-sm text-blue-700 mt-1 list-decimal list-inside space-y-1">
                <li>Select a credit package below</li>
                <li>Choose your preferred payment method</li>
                <li>Make the payment using the details provided</li>
                <li>Our team will verify and credit your account within 24 hours</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Credit Packages */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Choose a Package
        </h2>
        {packages.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-gray-500">No packages available at the moment.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {packages.map((pkg) => (
              <Card
                key={pkg.id}
                className={`relative hover:shadow-lg transition-shadow ${
                  pkg.isPopular ? "border-green-500 border-2" : ""
                }`}
              >
                {pkg.isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}
                <CardHeader className="text-center pt-6">
                  <div className="mx-auto mb-2 h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                    <Crown
                      className={`h-6 w-6 ${
                        pkg.isPopular ? "text-green-600" : "text-gray-600"
                      }`}
                    />
                  </div>
                  <CardTitle className="text-lg">{pkg.name}</CardTitle>
                  <CardDescription>
                    <span className="text-3xl font-bold text-gray-900">
                      {pkg.credits}
                    </span>
                    <span className="text-gray-500"> credits</span>
                    {pkg.bonusCredits > 0 && (
                      <span className="block text-green-600 text-sm font-medium mt-1">
                        +{pkg.bonusCredits} bonus credits
                      </span>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="mb-4">
                    <span className="text-2xl font-bold text-gray-900">
                      ${Number(pkg.price).toFixed(2)}
                    </span>
                    {pkg.savingsPercent && pkg.savingsPercent > 0 && (
                      <span className="ml-2 text-sm text-green-600">
                        Save {pkg.savingsPercent}%
                      </span>
                    )}
                  </div>
                  <ul className="text-sm text-gray-600 space-y-2 mb-4">
                    <li className="flex items-center justify-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      {pkg.credits + pkg.bonusCredits} total credits
                    </li>
                    <li className="flex items-center justify-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      Never expires
                    </li>
                  </ul>
                  <Button
                    className={`w-full ${
                      pkg.isPopular
                        ? "bg-green-600 hover:bg-green-700"
                        : "bg-gray-900 hover:bg-gray-800"
                    }`}
                    onClick={() => openPurchaseDialog(pkg)}
                    disabled={!!pendingRequest}
                  >
                    {pendingRequest ? "Complete Pending Request" : "Buy Now"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Recent Requests */}
      {requests.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Your Top-Up History
          </h2>
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {requests.slice(0, 5).map((request) => (
                  <div
                    key={request.id}
                    className="p-4 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        {(() => {
                          const Icon = getMethodIcon(request.paymentMethod);
                          return <Icon className="h-5 w-5 text-gray-600" />;
                        })()}
                      </div>
                      <div>
                        <p className="font-medium">
                          {request.package?.name || "Credit Package"}
                        </p>
                        <p className="text-sm text-gray-500">
                          #{request.requestNumber} •{" "}
                          {new Date(request.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {request.credits + request.bonusCredits} credits
                      </p>
                      <div className="mt-1">{getStatusBadge(request.status)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Purchase Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Complete Your Purchase</DialogTitle>
            <DialogDescription>
              Select a payment method to continue
            </DialogDescription>
          </DialogHeader>

          {selectedPackage && (
            <div className="space-y-4">
              {/* Package Summary */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="font-medium">{selectedPackage.name}</p>
                <p className="text-2xl font-bold mt-1">
                  {selectedPackage.credits + selectedPackage.bonusCredits} credits
                </p>
                <p className="text-lg text-gray-600">
                  ${Number(selectedPackage.price).toFixed(2)}
                </p>
              </div>

              {submitError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
                  <p className="text-red-700 text-sm">{submitError}</p>
                </div>
              )}

              {/* Payment Methods */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">
                  Select Payment Method
                </p>
                {paymentMethods.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    No payment methods available. Please contact support.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {paymentMethods.map((method) => {
                      const Icon = getMethodIcon(method.method);
                      return (
                        <button
                          key={method.id}
                          type="button"
                          onClick={() => setSelectedMethod(method)}
                          className={`w-full p-3 rounded-lg border-2 text-left transition-colors ${
                            selectedMethod?.id === method.id
                              ? "border-green-500 bg-green-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Icon className="h-5 w-5 text-gray-600" />
                            <span className="font-medium">{method.label}</span>
                            {selectedMethod?.id === method.id && (
                              <CheckCircle className="h-5 w-5 text-green-500 ml-auto" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  onClick={handleSubmitRequest}
                  disabled={!selectedMethod || submitting}
                  className="flex-1"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Submit Request"
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                  disabled={submitting}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Success Dialog with Payment Instructions */}
      <Dialog open={successDialogOpen} onOpenChange={setSuccessDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              Request Submitted Successfully
            </DialogTitle>
            <DialogDescription>
              Please complete your payment using the details below
            </DialogDescription>
          </DialogHeader>

          {successData && (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-green-700">
                  Your request number is:
                </p>
                <p className="text-xl font-bold text-green-800">
                  {successData.requestNumber}
                </p>
              </div>

              {successData.paymentDetails && (
                <div className="space-y-3">
                  <p className="font-medium">Payment Details:</p>

                  {successData.paymentDetails.bankName && (
                    <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-sm text-gray-600">Bank</span>
                      <span className="font-medium">{successData.paymentDetails.bankName}</span>
                    </div>
                  )}

                  {successData.paymentDetails.accountTitle && (
                    <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-sm text-gray-600">Account Title</span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{successData.paymentDetails.accountTitle}</span>
                        <button
                          onClick={() => copyToClipboard(successData.paymentDetails!.accountTitle!)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {successData.paymentDetails.accountNumber && (
                    <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-sm text-gray-600">Account Number</span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{successData.paymentDetails.accountNumber}</span>
                        <button
                          onClick={() => copyToClipboard(successData.paymentDetails!.accountNumber!)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {successData.paymentDetails.mobileNumber && (
                    <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-sm text-gray-600">Mobile Number</span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{successData.paymentDetails.mobileNumber}</span>
                        <button
                          onClick={() => copyToClipboard(successData.paymentDetails!.mobileNumber!)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="p-3 bg-blue-50 rounded-lg mt-4">
                    <p className="text-sm text-blue-800 whitespace-pre-wrap">
                      {successData.paymentDetails.instructions}
                    </p>
                  </div>
                </div>
              )}

              <Button
                onClick={() => setSuccessDialogOpen(false)}
                className="w-full"
              >
                Done
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Top-Up Request</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this request? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={cancelling}>Keep Request</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelRequest}
              disabled={cancelling}
              className="bg-red-600 hover:bg-red-700"
            >
              {cancelling ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Cancelling...
                </>
              ) : (
                "Cancel Request"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
