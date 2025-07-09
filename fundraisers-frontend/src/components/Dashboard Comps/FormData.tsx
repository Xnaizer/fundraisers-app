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

  const checkAdminAuth = useCallback(async () => {
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
    } catch (error: unknown) {
      console.error('Error checking admin auth:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(`Failed to verify admin access: ${errorMessage}`);
    }
  }, [checkConnection, getCurrentAddress, getContract]);

  useEffect(() => {
    checkAdminAuth();
  }, [checkAdminAuth]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const removeFile = () => {
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

  const handleSubmit = async (e: React.FormEvent) => {
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

      // Step 2: Create program on blockchain
      const programData = {
        name: formData.programName.trim(),
        picName: formData.picName.trim(),
        target: formData.targetBudget, // Keep as string - useContract will handle conversion
        desc: formData.description.trim(),
        pic: formData.addressPic.trim(),
        category: formData.category,
        programLink: formData.programLink.trim() || "",
        photoUrl: photoUrl
      };

      console.log('📝 Creating program with data:', programData);

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

    } catch (error: unknown) {
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
    <div className="bg-black min-h-screen w-full z-50 flex items-center justify-center p-4 sm:p-8 md:p-12">
      <div className="bg-neutral-950 text-white w-full max-w-[90%] sm:max-w-2xl p-14 sm:p-16 md:p-20 mt-16 rounded-2xl relative"
        style={{ boxShadow: '0 0 10px 1px rgba(0, 100, 255, 1)' }}>
        
        <h2 className="text-sm md:text-xl font-thin mb-6 text-white">
          Add <span className="text-cyan-400 text-sm md:text-xl">Fund</span>raisers New Program
        </h2>

        {/* Admin Info */}
        {isAuthorized && currentAddress && (
          <div className="mb-6 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
            <p className="text-green-400 text-sm">
              ✅ Admin Access | {currentAddress.slice(0, 6)}...{currentAddress.slice(-4)}
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
            <p className="text-green-400 text-sm">{success}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              name="programName"
              value={formData.programName}
              onChange={handleInputChange}
              placeholder="Program Name"
              className="w-full md:w-1/2 px-5 py-2 md:py-3 border-[1px] border-blue-500 bg-neutral-900 rounded-md text-white placeholder:font-thin placeholder:text-sm"
              disabled={!isAuthorized || isSubmitting}
              required
            />
            <input
              type="text"
              name="picName"
              value={formData.picName}
              onChange={handleInputChange}
              placeholder="PIC Name"
              className="w-full md:w-1/2 px-5 py-2 md:py-3 border border-blue-500 bg-neutral-900 rounded-md text-white placeholder:font-thin placeholder:text-sm"
              disabled={!isAuthorized || isSubmitting}
              required
            />
          </div>

          <input
            type="text"
            name="addressPic"
            value={formData.addressPic}
            onChange={handleInputChange}
            placeholder="Address PIC (Ethereum Address)"
            className="w-full px-5 py-2 md:py-3 border border-blue-500 bg-neutral-900 rounded-md text-white placeholder:font-thin placeholder:text-sm"
            disabled={!isAuthorized || isSubmitting}
            required
          />

          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Program Description"
            className="w-full px-5 py-2 md:py-3 border border-blue-500 bg-neutral-900 rounded-md text-white placeholder:font-thin placeholder:text-sm resize-none"
            rows={3}
            disabled={!isAuthorized || isSubmitting}
            required
          />

          <div className="flex flex-col md:flex-row gap-4">
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="w-full md:w-1/2 px-5 pr-10 py-2 md:py-3 border border-blue-500 bg-neutral-900 rounded-md text-sm text-neutral-400 appearance-none cursor-pointer"
              disabled={!isAuthorized || isSubmitting}
              required
            >
              <option value="">Select Category →</option>
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

            <input
              type="url"
              name="programLink"
              value={formData.programLink}
              onChange={handleInputChange}
              placeholder="Program Link (Optional)"
              className="w-full md:w-1/2 px-5 py-2 md:py-3 border border-blue-500 bg-neutral-900 rounded-md text-white placeholder:font-thin placeholder:text-sm"
              disabled={!isAuthorized || isSubmitting}
            />
          </div>

          <input
            type="number"
            name="targetBudget"
            value={formData.targetBudget}
            onChange={handleInputChange}
            placeholder="Target Budget (IDRX)"
            step="0.01"
            min="0"
            className="w-full px-5 py-2 md:py-3 border border-blue-500 bg-neutral-900 rounded-md text-white placeholder:font-thin placeholder:text-sm"
            disabled={!isAuthorized || isSubmitting}
            required
          />

          {/* File Upload Section */}
          <div className="w-full">
            <label className="block text-sm text-gray-300 mb-2">Program Photo</label>
            
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
                  className="w-full px-5 py-8 border-2 border-dashed border-blue-500 bg-neutral-900 rounded-md text-white cursor-pointer hover:bg-neutral-800 transition-colors flex flex-col items-center justify-center gap-2"
                >
                  <Upload className="w-8 h-8 text-blue-500" />
                  <span className="text-sm font-thin">Click to upload image</span>
                  <span className="text-xs text-gray-400">PNG, JPG, GIF up to 10MB</span>
                </label>
              </div>
            ) : (
              <div className="w-full border border-blue-500 bg-neutral-900 rounded-md p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-white truncate">{formData.photoFile.name}</span>
                  <button
                    type="button"
                    onClick={removeFile}
                    className="text-red-400 hover:text-red-300 flex-shrink-0 ml-2"
                    disabled={isSubmitting}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                {previewUrl && (
                  <div className="relative w-full h-32">
                    <Image 
                      src={previewUrl} 
                      alt="Preview" 
                      fill
                      className="object-cover rounded-md"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={!isAuthorized || isSubmitting || isUploading}
            className="w-full py-2 md:py-3 mt-4 bg-cyan-400 hover:bg-cyan-500 text-white rounded-md transition duration-300 font-thin cursor-pointer border-2 border-cyan-500 text-sm md:text-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isUploading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Uploading to IPFS...
              </>
            ) : isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Creating Program...
              </>
            ) : (
              'Add Program'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}