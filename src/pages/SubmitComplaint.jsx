import React, { useState } from 'react';
import Card from '../components/Card';
import { Send, Image as ImageIcon, CheckCircle2, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useComplaints } from '../context/ComplaintsContext';
import './SubmitComplaint.css';

const SubmitComplaint = () => {
  const { user } = useAuth();
  const { addComplaint } = useComplaints();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [room, setRoom] = useState(user?.room || '');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        // Create an image to resize it before saving (to prevent localStorage quota exceeded)
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Max dimensions
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          // Compress to JPEG with 0.6 quality to drastically reduce size for localStorage
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.6);
          setImages(prev => [...prev, compressedBase64]);
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (indexToRemove) => {
    setImages(images.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Create new complaint object
    const newComplaint = {
      title,
      category,
      room,
      description,
      images
    };

    // Simulate API call
    setTimeout(() => {
      addComplaint(newComplaint, user);
      setIsSubmitting(false);
      setIsSuccess(true);
      
      // Reset form
      setTitle('');
      setCategory('');
      setDescription('');
      setImages([]);
      
      // Keep success message visible until user clicks 'Submit Another' or navigates away
      // (Removed the auto-reset timer to act more like a static popup confirmation)
    }, 1500);
  };

  return (
    <div className="submit-page animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Submit an Issue</h1>
        <p className="text-muted">Report a new maintenance issue to the hostel management.</p>
      </div>

      <div className="form-container">
        <Card className="form-card">
          {isSuccess ? (
            <div className="success-state animate-fade-in">
              <CheckCircle2 size={64} className="success-icon" />
              <h2>Issue Submitted!</h2>
              <p className="text-muted">Your complaint has been successfully registered. The maintenance team will look into it shortly.</p>
              <button className="btn btn-primary mt-4" onClick={() => setIsSuccess(false)}>Submit Another</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="complaint-form">
              <div className="form-row">
                <div className="input-group">
                  <label className="input-label">Category</label>
                  <select 
                    className="input-field select-field" 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                  >
                    <option value="" disabled>Select an issue category</option>
                    <option value="Electrical">Electrical</option>
                    <option value="Plumbing">Plumbing</option>
                    <option value="Carpentry">Carpentry</option>
                    <option value="Cleaning">Cleaning / Hygiene</option>
                    <option value="WiFi">Internet / WiFi</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                
                <div className="input-group">
                  <label className="input-label">Room / Location</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    placeholder="e.g. Room 402, Ground Floor Washroom" 
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                    required 
                  />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Issue Title</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="Brief summary of the issue" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required 
                />
              </div>

              <div className="input-group">
                <label className="input-label">Detailed Description</label>
                <textarea 
                  className="input-field textarea-field" 
                  placeholder="Please provide as much detail as possible to help the maintenance team." 
                  rows="5"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                ></textarea>
              </div>

              <div className="input-group">
                <label className="input-label">Attachments (Optional)</label>
                <div className="upload-area glass">
                  <ImageIcon size={32} className="upload-icon" />
                  <p>Drag & drop photos here or <span className="text-accent cursor-pointer">browse</span></p>
                  <p className="text-xs text-muted">Max file size: 5MB</p>
                  <input 
                    type="file" 
                    className="file-input-hidden" 
                    multiple 
                    accept="image/*" 
                    onChange={handleImageUpload}
                  />
                </div>
                
                {images.length > 0 && (
                  <div className="image-preview-container">
                    {images.map((imgSrc, idx) => (
                      <div key={idx} className="image-thumbnail">
                        <img src={imgSrc} alt="Preview" />
                        <button type="button" className="remove-image-btn" onClick={() => removeImage(idx)}>
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? (
                    'Submitting...'
                  ) : (
                    <>
                      <Send size={18} />
                      <span>Submit Request</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </Card>

        <div className="info-sidebar">
          <Card className="info-card">
            <h3 className="info-title">Reporting Guidelines</h3>
            <ul className="info-list">
              <li>Please provide exact location details for faster resolution.</li>
              <li>Attach clear photos if possible to help diagnose the issue.</li>
              <li>For emergencies like major leaks or sparks, contact the warden immediately.</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SubmitComplaint;
