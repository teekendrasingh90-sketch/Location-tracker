import React, { useState } from 'react';
import { LocationDetails } from '../types';
import { Copy, Check, MapPin, ExternalLink, Home } from 'lucide-react';

interface InfoCardProps {
  data: LocationDetails;
  coords: { lat: number; lng: number };
}

export const InfoCard: React.FC<InfoCardProps> = ({ data, coords }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    // Clean up the text for copying (remove markdown asterisks if needed, but keeping them is usually fine)
    const textToCopy = `${data.text}\n\nGPS: ${coords.lat}, ${coords.lng}`;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 animate-fade-in-up">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center text-white">
          <Home className="h-5 w-5 mr-2" />
          <h2 className="text-lg font-semibold">Address Details</h2>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 text-white/90 hover:text-white hover:bg-white/10 px-3 py-1.5 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-white/50 text-sm font-medium"
          title="Copy full address"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4" />
              <span>Copied</span>
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              <span>Copy All</span>
            </>
          )}
        </button>
      </div>

      <div className="p-6">
        {/* Coordinates Tag */}
        <div className="mb-6 flex flex-wrap gap-2 justify-center sm:justify-start">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                <MapPin className="w-3 h-3 mr-1" />
                {coords.lat.toFixed(6)}, {coords.lng.toFixed(6)}
            </span>
        </div>

        {/* Main Content */}
        <div className="prose prose-indigo max-w-none text-gray-800 leading-relaxed">
          {/* We render the text nicely, preserving line breaks */}
          <div className="whitespace-pre-wrap text-sm md:text-base bg-slate-50 p-5 rounded-xl border border-slate-200 shadow-sm font-medium">
            {data.text}
          </div>
        </div>

        {/* Sources / Map Link */}
        <div className="mt-6 pt-4 border-t border-gray-100">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Locations & Landmarks
            </h3>
            <div className="flex flex-wrap gap-2">
              {data.sources && data.sources.length > 0 ? (
                data.sources.map((source, index) => (
                  <a
                    key={index}
                    href={source.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-xs text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 px-3 py-1.5 rounded-full transition-colors max-w-full"
                  >
                    <ExternalLink className="w-3 h-3 mr-1.5 flex-shrink-0" />
                    <span className="truncate max-w-[250px]">{source.title}</span>
                  </a>
                ))
              ) : (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${coords.lat},${coords.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-xs text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 px-3 py-1.5 rounded-full transition-colors"
                >
                   <ExternalLink className="w-3 h-3 mr-1.5 flex-shrink-0" />
                   Open in Google Maps
                </a>
              )}
            </div>
        </div>
      </div>
      
      <div className="bg-gray-50 px-6 py-3 border-t border-gray-100 text-center text-xs text-gray-400">
        AI-generated address. Verify exact building numbers.
      </div>
    </div>
  );
};
