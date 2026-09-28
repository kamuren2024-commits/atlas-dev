import React, { useState, useRef } from 'react';
import { Upload, FilePlus, FolderPlus, Database, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface IntakeLayerProps {
  onUploadComplete: () => void;
}

export function IntakeLayer({ onUploadComplete }: IntakeLayerProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    
    // Simulate batch ingestion
    for (const file of Array.from(files)) {
      await fetch('/api/v2/evaluation/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: file.name, size: file.size, uploader: 'John Doe' })
      });
    }
    
    setTimeout(() => {
      setUploading(false);
      onUploadComplete();
    }, 1000);
  };

  return (
    <div className="p-4 border-b border-white/5 space-y-3">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Intake Layer</h3>
        <Database className="w-3 h-3 text-white/20" />
      </div>

      <div 
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleUpload(e.dataTransfer.files); }}
        className={`relative h-24 rounded-xl border border-dashed transition-all flex flex-col items-center justify-center gap-2 group cursor-pointer ${
          isDragging ? 'bg-indigo-500/10 border-indigo-500/50' : 'bg-white/[0.02] border-white/10 hover:border-white/20'
        }`}
        onClick={() => fileInputRef.current?.click()}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          multiple 
          onChange={(e) => handleUpload(e.target.files)} 
        />
        
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Ingesting...</span>
          </div>
        ) : (
          <>
            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center transition-transform group-hover:scale-110">
              <Upload className="w-4 h-4 text-white/40" />
            </div>
            <div className="text-center">
              <p className="text-[10px] font-bold text-white/60 uppercase">Drop Tender Files</p>
              <p className="text-[8px] text-white/20 font-mono mt-0.5">PDF, DOCX, ZIP, IMAGES</p>
            </div>
          </>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button className="flex items-center justify-center gap-2 py-2 rounded-lg bg-white/5 border border-white/10 text-[9px] font-bold text-white/60 hover:text-white transition-colors cursor-pointer">
          <FilePlus className="w-3 h-3" />
          SINGLE FILE
        </button>
        <button className="flex items-center justify-center gap-2 py-2 rounded-lg bg-white/5 border border-white/10 text-[9px] font-bold text-white/60 hover:text-white transition-colors cursor-pointer">
          <FolderPlus className="w-3 h-3" />
          TENDER FOLDER
        </button>
      </div>
    </div>
  );
}
