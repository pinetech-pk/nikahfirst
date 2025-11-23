import { useState } from "react";

/**
 * Custom hook for managing form state with loading, error, and success states
 * Eliminates duplicated form state management patterns across the application
 *
 * @template T - The type of the form data
 * @param initialValues - Initial values for the form
 * @returns Form state and handlers
 *
 * @example
 * ```tsx
 * const form = useForm({ name: "", email: "" });
 *
 * // Access form data
 * <Input value={form.formData.name} onChange={(e) => form.setFormData({ ...form.formData, name: e.target.value })} />
 *
 * // Show loading state
 * {form.loading && <Spinner />}
 *
 * // Show error
 * {form.error && <Alert>{form.error}</Alert>}
 *
 * // Show success
 * {form.success && <Alert>{form.success}</Alert>}
 *
 * // Submit handler
 * const handleSubmit = async (e) => {
 *   e.preventDefault();
 *   form.startLoading();
 *   try {
 *     await api.submit(form.formData);
 *     form.setSuccess("Saved successfully!");
 *   } catch (err) {
 *     form.setError(err.message);
 *   } finally {
 *     form.stopLoading();
 *   }
 * };
 * ```
 */
export function useForm<T extends Record<string, any>>(initialValues: T) {
  const [formData, setFormData] = useState<T>(initialValues);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /**
   * Update a single field in the form
   * Automatically clears error and success messages when user modifies the form
   */
  const updateField = <K extends keyof T>(field: K, value: T[K]) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear messages when user starts typing/modifying the form
    setError("");
    setSuccess("");
  };

  /**
   * Update multiple fields at once
   * Automatically clears error and success messages when user modifies the form
   */
  const updateFields = (fields: Partial<T>) => {
    setFormData((prev) => ({
      ...prev,
      ...fields,
    }));
    // Clear messages when user starts typing/modifying the form
    setError("");
    setSuccess("");
  };

  /**
   * Reset form to initial values
   */
  const reset = () => {
    setFormData(initialValues);
    setError("");
    setSuccess("");
  };

  /**
   * Reset only messages (error and success)
   */
  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  /**
   * Start loading state
   */
  const startLoading = () => {
    setLoading(true);
    clearMessages();
  };

  /**
   * Stop loading state
   */
  const stopLoading = () => {
    setLoading(false);
  };

  /**
   * Set error message (also stops loading)
   */
  const setErrorMessage = (message: string) => {
    setError(message);
    setSuccess("");
    setLoading(false);
  };

  /**
   * Set success message (also stops loading and clears error)
   */
  const setSuccessMessage = (message: string) => {
    setSuccess(message);
    setError("");
    setLoading(false);
  };

  /**
   * Check if form has changes compared to initial values
   */
  const hasChanges = () => {
    return JSON.stringify(formData) !== JSON.stringify(initialValues);
  };

  return {
    // State
    formData,
    loading,
    error,
    success,

    // Setters
    setFormData,
    setLoading,
    setError,
    setSuccess,

    // Helper methods
    updateField,
    updateFields,
    reset,
    clearMessages,
    startLoading,
    stopLoading,
    setErrorMessage,
    setSuccessMessage,
    hasChanges,
  };
}

/**
 * Type for the return value of useForm
 */
export type UseFormReturn<T extends Record<string, any>> = ReturnType<
  typeof useForm<T>
>;
