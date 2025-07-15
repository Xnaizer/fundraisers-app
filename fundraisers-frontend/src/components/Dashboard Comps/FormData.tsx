"use client";

import { useState, useEffect, useCallback } from "react";
import { useContract } from "../../hooks/useContract";
import { PinataService } from "../../lib/pinataService";
import { Upload, X, CheckCircle, AlertCircle } from "lucide-react";
import { ethers } from "ethers";
import Image from "next/image";

interface FormDataState {
  programName: string;
  picName: string;
  addressPic: string;
  description: string;
  category: string;
  programLink: string;
  targetBudget: string;
  photoFile: File | null;
}

export default function FormData() {
  const [formData, setFormData] = useState<FormDataState>({
    programName: '',
    picName: '',
    addressPic: '',
    description: '',
    category: '',
    programLink: '',
    targetBudget: '',
    photoFile: null
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [currentAddress, setCurrentAddress] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const { 
    createProgram, 
    getCurrentAddress, 
    checkConnection, 
    getContract 
  } = useContract();

  const checkAdminAuth = useCallback(async (): Promise<void> => {
    try {
      const isConnected = await checkConnection();
      if (!isConnected) {
        setError('Please connect your wallet first');
        return;
      }

      const address = await getCurrentAddress();
      if (!address) {
        setError('Could not get wallet address');
        return;
      }

      setCurrentAddress(address);

      // Check if user is contract owner
      const contract = await getContract('FUNDRAISERS');
      const owner = await contract.owner();

      if (address.toLowerCase() === owner.toLowerCase()) {
        setIsAuthorized(true);
        setError('');
      } else {
        setError('Access denied: Only contract owner can create programs');
      }
    } catch (error) {
      console.error('Error checking admin auth:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(`Failed to verify admin access: ${errorMessage}`);
    }
  }, [checkConnection, getCurrentAddress, getContract]);

  useEffect(() => {
    checkAdminAuth();
  }, [checkAdminAuth]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>): void => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }

      setFormData(prev => ({ ...prev, photoFile: file }));
      
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setError('');
    }
  };

  const removeFile = (): void => {
    setFormData(prev => ({ ...prev, photoFile: null }));
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  const validateForm = (): boolean => {
    if (!formData.programName.trim()) {
      setError('Program name is required');
      return false;
    }
    if (!formData.picName.trim()) {
      setError('PIC name is required');
      return false;
    }
    if (!formData.addressPic.trim()) {
      setError('PIC address is required');
      return false;
    }
    if (!formData.description.trim()) {
      setError('Program description is required');
      return false;
    }
    if (!formData.category) {
      setError('Please select a category');
      return false;
    }
    if (!formData.targetBudget.trim()) {
      setError('Target budget is required');
      return false;
    }
    if (!formData.photoFile) {
      setError('Please upload a program photo');
      return false;
    }

    // Validate target budget is a number
    if (isNaN(parseFloat(formData.targetBudget)) || parseFloat(formData.targetBudget) <= 0) {
      setError('Please enter a valid target budget');
      return false;
    }

    // Validate Ethereum address
    if (!ethers.isAddress(formData.addressPic)) {
      setError('Please enter a valid Ethereum address for PIC');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    
    if (!isAuthorized) {
      setError('You are not authorized to create programs');
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      // Step 1: Upload image to Pinata IPFS
      setIsUploading(true);
      const photoUrl = await PinataService.uploadFile(formData.photoFile!);
      setIsUploading(false);

      console.log('✅ Image uploaded to IPFS:', photoUrl);

      // Step 2: Convert target budget string to bigint
      // Assuming 2 decimal places for IDRX (like cents for USD)
      const targetAmountString = parseFloat(formData.targetBudget).toFixed(2);
      const targetAmountInSmallestUnit = Math.round(parseFloat(targetAmountString) * 100);
      const targetBigInt = BigInt(targetAmountInSmallestUnit);

      // Step 3: Create program on blockchain
      const programData = {
        name: formData.programName.trim(),
        picName: formData.picName.trim(),
        target: targetBigInt, // Now sending as bigint
        desc: formData.description.trim(),
        pic: formData.addressPic.trim(),
        category: formData.category,
        programLink: formData.programLink.trim() || "",
        photoUrl: photoUrl
      };

      console.log('📝 Creating program with data:', {
        ...programData,
        target: targetBigInt.toString() // Log as string for readability
      });

      const txHash = await createProgram(programData);
      
      console.log('✅ Program created successfully:', txHash);
      setSuccess(`Program created successfully! Transaction: ${txHash.slice(0, 10)}...`);

      // Reset form
      setFormData({
        programName: '',
        picName: '',
        addressPic: '',
        description: '',
        category: '',
        programLink: '',
        targetBudget: '',
        photoFile: null
      });
      removeFile();

      // Auto-hide success message
      setTimeout(() => setSuccess(''), 5000);

    } catch (error) {
      console.error('❌ Error creating program:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      if (errorMessage.includes('user rejected')) {
        setError('Transaction was rejected by user');
      } else {
        setError(`Failed to create program: ${errorMessage}`);
      }
    } finally {
      setIsSubmitting(false);
      setIsUploading(false);
    }
  };

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  if (!isAuthorized && !error) {
    return (
      <div className="bg-black min-h-screen w-full flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Checking admin access...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-black to-gray-900 min-h-screen w-full py-6 md:py-12">
      <div className="container mx-auto px-4 sm:px-6 md:px-8 max-w-5xl">
        {/* Page Header */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-light text-white">
            Add <span className="text-cyan-400 font-normal">Fund</span>raisers Program
          </h1>
          <p className="mt-2 text-gray-400 text-sm sm:text-base">Create a new fundraising program for the community</p>
        </div>

        {/* Admin Status Banner */}
        {isAuthorized && currentAddress && (
          <div className="mb-6 bg-green-900/20 border border-green-500/30 rounded-lg p-3 sm:p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <p className="text-green-400 text-sm">
                <span className="hidden xs:inline">Admin Access |</span> Connected as
              </p>
            </div>
            <p className="font-mono text-sm text-white bg-black/30 px-3 py-1 rounded-md">
              {currentAddress.slice(0, 6)}...{currentAddress.slice(-4)}
            </p>
          </div>
        )}

        {/* Messages */}
        {error && (
          <div className="mb-6 bg-red-900/20 border border-red-500/30 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-900/20 border border-green-500/30 rounded-lg p-4 flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-green-400 font-medium text-sm">Success!</h4>
              <p className="text-green-300 text-sm mt-1">{success}</p>
            </div>
          </div>
        )}

        {/* Form Card */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 shadow-xl overflow-hidden">
          {/* Form Header */}
          <div className="bg-gray-800 px-6 py-4 border-b border-gray-700">
            <h2 className="text-lg text-white font-medium">Program Details</h2>
            <p className="text-gray-400 text-sm">Fill in all required information</p>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-5">
                <div>
                  <label className="block text-sm text-gray-300 mb-1.5">Program Name *</label>
                  <input
                    type="text"
                    name="programName"
                    value={formData.programName}
                    onChange={handleInputChange}
                    placeholder="Enter program name"
                    className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 focus:border-cyan-500 rounded-lg text-white text-sm focus:outline-none transition-colors"
                    disabled={!isAuthorized || isSubmitting}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-1.5">PIC Name *</label>
                  <input
                    type="text"
                    name="picName"
                    value={formData.picName}
                    onChange={handleInputChange}
                    placeholder="Person in charge name"
                    className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 focus:border-cyan-500 rounded-lg text-white text-sm focus:outline-none transition-colors"
                    disabled={!isAuthorized || isSubmitting}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-1.5">PIC Address *</label>
                  <input
                    type="text"
                    name="addressPic"
                    value={formData.addressPic}
                    onChange={handleInputChange}
                    placeholder="0x..."
                    className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 focus:border-cyan-500 rounded-lg text-white text-sm font-mono focus:outline-none transition-colors"
                    disabled={!isAuthorized || isSubmitting}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-1.5">Category *</label>
                  <div className="relative">
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 focus:border-cyan-500 rounded-lg text-white text-sm appearance-none focus:outline-none transition-colors"
                      disabled={!isAuthorized || isSubmitting}
                      required
                    >
                      <option value="">Select a category</option>
                      <option value="Society">Society</option>
                      <option value="Environment">Environment</option>
                      <option value="Technology">Technology</option>
                      <option value="Health">Health</option>
                      <option value="Education">Education</option>
                      <option value="Emergency">Emergency</option>
                      <option value="Animals">Animals</option>
                      <option value="Sports">Sports</option>
                      <option value="Arts">Arts</option>
                      <option value="Culture">Culture</option>
                      <option value="Religious">Religious</option>
                    </select>
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-1.5">Target Budget (IDRX) *</label>
                  <input
                    type="number"
                    name="targetBudget"
                    value={formData.targetBudget}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 focus:border-cyan-500 rounded-lg text-white text-sm focus:outline-none transition-colors"
                    disabled={!isAuthorized || isSubmitting}
                    required
                  />
                  {formData.targetBudget && (
                    <p className="text-xs text-cyan-400 mt-1.5">
                      Wei equivalent: {Math.round(parseFloat(formData.targetBudget || '0') * 100)}
                    </p>
                  )}
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-5">
                <div>
                  <label className="block text-sm text-gray-300 mb-1.5">Program Description *</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe the program and its goals"
                    className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 focus:border-cyan-500 rounded-lg text-white text-sm focus:outline-none transition-colors resize-none"
                    rows={4}
                    disabled={!isAuthorized || isSubmitting}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-1.5">Program Link</label>
                  <input
                    type="url"
                    name="programLink"
                    value={formData.programLink}
                    onChange={handleInputChange}
                    placeholder="https://..."
                    className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 focus:border-cyan-500 rounded-lg text-white text-sm focus:outline-none transition-colors"
                    disabled={!isAuthorized || isSubmitting}
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-1.5">Program Photo *</label>
                  
                  {!formData.photoFile ? (
                    <div className="w-full">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                        id="photo-upload"
                        disabled={!isAuthorized || isSubmitting}
                      />
                      <label
                        htmlFor="photo-upload"
                        className="w-full py-5 border-2 border-dashed border-gray-600 hover:border-cyan-500 rounded-lg flex flex-col items-center justify-center gap-2 cursor-pointer bg-gray-800 hover:bg-gray-750 transition-colors"
                      >
                        <Upload className="w-8 h-8 text-cyan-400" />
                        <span className="text-sm text-gray-300">Click to upload an image</span>
                        <span className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</span>
                      </label>
                    </div>
                  ) : (
                    <div className="border border-gray-700 rounded-lg overflow-hidden">
                      <div className="flex items-center justify-between bg-gray-800 px-3 py-2 border-b border-gray-700">
                        <span className="text-sm text-white truncate pr-2 max-w-[80%]">{formData.photoFile.name}</span>
                        <button
                          type="button"
                          onClick={removeFile}
                          className="text-gray-400 hover:text-red-400 p-1 rounded-full hover:bg-gray-700 transition-colors"
                          disabled={isSubmitting}
                          aria-label="Remove file"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      {previewUrl && (
                        <div className="relative w-full h-40">
                          <Image 
                            src={previewUrl} 
                            alt="Preview" 
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4 items-center">
              <button
                type="submit"
                disabled={!isAuthorized || isSubmitting || isUploading}
                className="w-full sm:flex-1 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-lg transition duration-300 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
              >
                {isUploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Uploading to IPFS...</span>
                  </>
                ) : isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Creating Program...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Create Program</span>
                  </>
                )}
              </button>
              
              {!isSubmitting && !isUploading && (
                <button
                  type="button"
                  onClick={() => {
                    setFormData({
                      programName: '',
                      picName: '',
                      addressPic: '',
                      description: '',
                      category: '',
                      programLink: '',
                      targetBudget: '',
                      photoFile: null
                    });
                    removeFile();
                  }}
                  className="w-full sm:w-auto py-3 px-6 border border-gray-600 text-gray-300 hover:bg-gray-800 rounded-lg transition duration-300 text-sm"
                >
                  Reset Form
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 text-xs">
          <p>All programs are stored on the blockchain and IPFS for transparency</p>
        </div>
      </div>
    </div>
  );
}