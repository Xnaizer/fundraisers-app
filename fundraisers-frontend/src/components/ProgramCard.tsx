"use client"

import Image from "next/image";
import { FaGlobeAsia, FaArrowRight } from "react-icons/fa";
import { LuClock3 } from "react-icons/lu";
import { useState } from "react";

interface ProgramCardProps {
  onOpen: () => void;
  name: string;
  desc: string;
  category:
    | 'Society'
    | 'Environment' 
    | 'Technology'
    | 'Health'
    | 'Education'
    | 'Emergency'
    | 'Animals'
    | 'Sports'
    | 'Arts'
    | 'Culture'
    | 'Religious';
  photoUrl: string;
  createdAt: string;
  target?: string;
  allocated?: string;
  status?: number;
  picName?: string;
}

export default function ProgramCard(props: ProgramCardProps) {
  const { 
    name, 
    desc, 
    category, 
    photoUrl, 
    createdAt, 
    onOpen, 
    target, 
    allocated, 
    status,
    picName 
  } = props;

  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  // Calculate progress percentage with better error handling
  const calculateProgress = (): number => {
    if (!target || !allocated) return 0;
    
    const targetNum = parseFloat(target);
    const allocatedNum = parseFloat(allocated);
    
    if (isNaN(targetNum) || isNaN(allocatedNum) || targetNum === 0) return 0;
    
    return Math.min((allocatedNum / targetNum) * 100, 100);
  };

  const progress = calculateProgress();

  // Enhanced status configuration
  const getStatusConfig = (status?: number) => {
    switch (status) {
      case 0: 
        return { 
          text: 'Inactive', 
          color: 'bg-gray-500/20 text-gray-400 border-gray-500/50',
          dot: 'bg-gray-400'
        };
      case 1: 
        return { 
          text: 'Active', 
          color: 'bg-green-500/20 text-green-400 border-green-500/50',
          dot: 'bg-green-400'
        };
      case 2: 
        return { 
          text: 'Funded', 
          color: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
          dot: 'bg-blue-400'
        };
      case 3: 
        return { 
          text: 'Completed', 
          color: 'bg-purple-500/20 text-purple-400 border-purple-500/50',
          dot: 'bg-purple-400'
        };
      default: 
        return { 
          text: 'Unknown', 
          color: 'bg-gray-500/20 text-gray-400 border-gray-500/50',
          dot: 'bg-gray-400'
        };
    }
  };

  const statusConfig = getStatusConfig(status);

  // Enhanced currency formatter
  const formatCurrency = (amount: string): string => {
    const num = parseFloat(amount);
    if (isNaN(num)) return '0';
    
    if (num >= 1000000000) {
      return `${(num / 1000000000).toFixed(1)}B`;
    } else if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toLocaleString();
  };

  // Enhanced date formatter
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      
      return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch (error) {
      console.warn('Error formatting date:', error);
      return 'Unknown date';
    }
  };

  // Enhanced description truncator
  const truncateDesc = (text: string, maxLength: number = 120): string => {
    if (!text) return 'No description available';
    if (text.length <= maxLength) return text;
    
    // Try to break at word boundary
    const truncated = text.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    
    if (lastSpace > maxLength * 0.8) {
      return truncated.substring(0, lastSpace) + '...';
    }
    
    return truncated.trim() + '...';
  };

  // Get category icon
  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      'Society': '👥',
      'Environment': '🌱',
      'Technology': '💻',
      'Health': '🏥',
      'Education': '📚',
      'Emergency': '🚨',
      'Animals': '🐾',
      'Sports': '⚽',
      'Arts': '🎨',
      'Culture': '🏛️',
      'Religious': '🕌'
    };
    return icons[category] || '📂';
  };

  // Handle image error
  const handleImageError = () => {
    console.warn(`Failed to load image: ${photoUrl}`);
    setImageError(true);
    setImageLoading(false);
  };

  // Handle image load
  const handleImageLoad = () => {
    setImageLoading(false);
  };

  // Check if image URL is valid
  const isValidImageUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <article className="w-full max-w-sm lg:max-w-md bg-neutral-950 rounded-xl overflow-hidden cursor-pointer shadow-md hover:shadow-cyan-500/50 transition-all duration-300 hover:scale-[1.02] border border-neutral-800 hover:border-cyan-500/30"
      onClick={onOpen}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen();
        }
      }}
    >
      {/* Image Section */}
      <div className="relative w-full aspect-[16/9] overflow-hidden bg-neutral-800">
        {!imageError && isValidImageUrl(photoUrl) ? (
          <>
            {imageLoading && (
              <div className="absolute inset-0 bg-neutral-800 animate-pulse flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
            <Image
              src={photoUrl}
              alt={`${name} program image`}
              fill
              className="object-cover transition-transform duration-300 hover:scale-110"
              priority={false}
              onError={handleImageError}
              onLoad={handleImageLoad}
              unoptimized={photoUrl.includes('pinata.cloud') || photoUrl.includes('ipfs')}
            />
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-neutral-800 to-neutral-900 flex items-center justify-center">
            <div className="text-center text-neutral-600">
              <div className="text-4xl mb-2">{getCategoryIcon(category)}</div>
              <p className="text-sm">Image not available</p>
            </div>
          </div>
        )}
        
        {/* Status Badge */}
        {status !== undefined && (
          <div className="absolute top-3 left-3">
            <div className={`px-2 py-1 rounded-full text-xs border backdrop-blur-sm ${statusConfig.color} flex items-center gap-1 shadow-lg`}>
              <div className={`w-2 h-2 rounded-full ${statusConfig.dot}`}></div>
              {statusConfig.text}
            </div>
          </div>
        )}

        {/* Progress Badge */}
        {target && allocated && progress > 0 && (
          <div className="absolute top-3 right-3">
            <div className="px-2 py-1 rounded-full text-xs bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 backdrop-blur-sm shadow-lg">
              {progress.toFixed(0)}%
            </div>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-6 md:p-8">
        {/* Category and PIC */}
        <div className="flex items-center justify-between mb-3">
          <div className="text-cyan-400 flex items-center gap-2 text-sm lg:text-base">
            <FaGlobeAsia className="flex-shrink-0" /> 
            <span className="truncate">{category}</span>
          </div>
          {picName && (
            <p className="text-xs text-neutral-500 truncate ml-2" title={`by ${picName}`}>
              by {picName}
            </p>
          )}
        </div>

        {/* Title */}
        <h2 className="text-white text-lg md:text-[1rem] lg:text-xl py-2 leading-snug font-medium hover:text-cyan-400 transition-colors duration-300 line-clamp-2">
          {name}
        </h2>

        {/* Description */}
        <p className="text-neutral-400 text-sm md:text-base leading-relaxed tracking-tight pb-4 min-h-[3rem] line-clamp-3">
          {truncateDesc(desc)}
        </p>

        {/* Progress Bar */}
        {target && allocated && (
          <div className="mb-4">
            <div className="flex justify-between text-xs mb-2">
              <span className="text-neutral-400">Progress</span>
              <span className="text-cyan-400 font-medium">{progress.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-neutral-700 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${Math.min(progress, 100)}%` }}
                role="progressbar"
                aria-valuenow={progress}
                aria-valuemin={0}
                aria-valuemax={100}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-neutral-400 mt-2">
              <span>{formatCurrency(allocated)} IDRX</span>
              <span className="text-neutral-500">of {formatCurrency(target)} IDRX</span>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-between items-center  text-[0.7rem] md:text-[0.75rem] border-t border-neutral-800 pt-4">
          <div className="flex items-center gap-2 text-neutral-400">
            <LuClock3 className="text-neutral-500 flex-shrink-0" />
            <span className="truncate">Created {formatDate(createdAt)}</span>
          </div>

          <button
            className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 md:gap-2 group transition-colors duration-300 flex-shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              onOpen();
            }}
            aria-label={`View details for ${name}`}
          >
            <span className="text-xs font-medium">View Details</span>
            <FaArrowRight className="group-hover:translate-x-1 duration-300 text-xs" />
          </button>
        </div>
      </div>
    </article>
  );
}