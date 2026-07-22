import React, { useState, useEffect } from 'react';
import { Camera, MapPin, Phone, FileText, CheckCircle, X } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../services/api';

const getAuthHeaders = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem('hire_me_token')}`
  }
});

export default function ProfileSettings({ currentUser, onClose, onUserUpdate }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [formData, setFormData] = useState({
    phone_number: '',
    location_text: '',
    profile_picture_url: '',
    bio: '',
    resume_url: ''
  });
  const fileInputRef = React.useRef(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const [showUpgradeForm, setShowUpgradeForm] = useState(false);
  const [upgradeData, setUpgradeData] = useState({ trade: '', hourlyRate: '' });
  const [upgrading, setUpgrading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/users/profile`, getAuthHeaders());
      const data = res.data;
      setFormData({
        phone_number: data.phone_number || '',
        location_text: data.location_text || '',
        profile_picture_url: data.profile_picture_url || '',
        bio: data.profile?.bio || '',
        resume_url: data.profile?.resume_url || ''
      });
      setLoading(false);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    setErrorMsg('');

    try {
      await axios.put(`${API_BASE_URL}/users/profile`, formData, getAuthHeaders());
      setSuccess(true);
      if (onUserUpdate) {
        onUserUpdate({ name: currentUser.name }); 
      }
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving profile:', err);
      setErrorMsg(err.response?.data?.error || 'Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleUpgrade = async () => {
    if (!upgradeData.trade || !upgradeData.hourlyRate) return alert('Please enter your trade and hourly rate.');
    setUpgrading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/users/upgrade-to-provider`, {
        trade: upgradeData.trade,
        hourlyRate: parseFloat(upgradeData.hourlyRate)
      }, getAuthHeaders());
      
      localStorage.setItem('hire_me_token', res.data.token);
      window.location.href = '/provider';
    } catch (err) {
      console.error('Error upgrading:', err);
      alert(err.response?.data?.error || 'Failed to upgrade to professional.');
    } finally {
      setUpgrading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const data = new FormData();
    data.append('profile_picture', file);

    try {
      const res = await axios.post(`${API_BASE_URL}/users/profile/upload`, data, {
        headers: {
          ...getAuthHeaders().headers,
        }
      });
      setFormData({ ...formData, profile_picture_url: res.data.profile_picture_url });
      if (onUserUpdate) {
        onUserUpdate({ profile_picture_url: res.data.profile_picture_url });
      }
    } catch (err) {
      console.error('Error uploading image:', err);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/40 backdrop-blur-sm">
      <div className="bg-surface-bright w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl shadow-sm border border-outline animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <header className="sticky top-0 bg-surface-bright/90 backdrop-blur-md px-6 py-4 border-b border-outline flex justify-between items-center z-10">
          <h2 className="text-xl font-bold text-on-surface">Account Settings</h2>
          <button onClick={onClose} className="p-2 text-on-surface-variant hover:bg-surface-container rounded-full transition-colors">
            <X size={20} />
          </button>
        </header>

        {loading ? (
          <div className="p-12 text-center text-on-surface-variant">Loading profile...</div>
        ) : (
          <div className="p-6">
            
            {/* Avatar Section */}
            <div className="flex flex-col items-center mb-8">
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageUpload} 
                accept="image/*" 
                className="hidden" 
              />
              <div 
                className={`relative group cursor-pointer ${uploadingImage ? 'opacity-50' : ''}`}
                onClick={() => !uploadingImage && fileInputRef.current?.click()}
              >
                <div className="w-24 h-24 rounded-full border-4 border-surface-container bg-primary-container flex items-center justify-center overflow-hidden">
                  {formData.profile_picture_url ? (
                    <img src={formData.profile_picture_url} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl text-on-primary-container font-bold">{currentUser.name.charAt(0)}</span>
                  )}
                </div>
                <div className="absolute inset-0 bg-on-surface/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="text-white" size={24} />
                </div>
              </div>
              <p className="text-sm text-on-surface-variant mt-3 font-medium">
                {uploadingImage ? 'Uploading...' : 'Click to update photo'}
              </p>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Location */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-on-surface flex items-center gap-2">
                    <MapPin size={16} className="text-primary" /> Location (Address/City)
                  </label>
                  <input
                    type="text"
                    value={formData.location_text}
                    onChange={e => setFormData({...formData, location_text: e.target.value})}
                    placeholder="e.g. Douala, Bonamoussadi"
                    className="w-full bg-surface border border-outline px-4 py-3 rounded-lg text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-on-surface flex items-center gap-2">
                    <Phone size={16} className="text-primary" /> Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone_number}
                    onChange={e => setFormData({...formData, phone_number: e.target.value})}
                    placeholder="+237 6XX XXX XXX"
                    className="w-full bg-surface border border-outline px-4 py-3 rounded-lg text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>
              </div>



              {/* Provider Specific Fields */}
              {currentUser.role === 'PROVIDER' && (
                <>
                  <div className="space-y-2 pt-4 border-t border-outline">
                    <label className="text-sm font-bold text-on-surface flex items-center gap-2">
                      <FileText size={16} className="text-primary" /> Professional Bio
                    </label>
                    <textarea
                      rows="4"
                      value={formData.bio}
                      onChange={e => setFormData({...formData, bio: e.target.value})}
                      placeholder="Tell clients about your experience and skills..."
                      className="w-full bg-surface border border-outline px-4 py-3 rounded-lg text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-on-surface">Resume/Portfolio Link</label>
                    <input
                      type="url"
                      value={formData.resume_url}
                      onChange={e => setFormData({...formData, resume_url: e.target.value})}
                      placeholder="https://linkedin.com/in/you or Google Drive link"
                      className="w-full bg-surface border border-outline px-4 py-3 rounded-lg text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                    />
                  </div>
                </>
              )}

              {currentUser.role === 'PROVIDER' && (
                <div className="pt-6 border-t border-outline col-span-2">
                  <h3 className="text-lg font-bold text-on-surface mb-4">Verification Document</h3>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-bold text-on-surface mb-2">Upload ID or Certificate</label>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={async (e) => {
                          const file = e.target.files[0];
                          if (!file) return;
                          const formData = new FormData();
                          formData.append('verification_doc', file);
                          try {
                            const axios = (await import('axios')).default;
                            await axios.post(`${API_BASE_URL}/users/profile/document`, formData, {
                              headers: {
                                Authorization: `Bearer ${localStorage.getItem('hire_me_token')}`,
                              },
                            });
                            alert('Document uploaded successfully for review!');
                          } catch (err) {
                            alert('Failed to upload document.');
                          }
                        }}
                        className="block w-full text-sm text-on-surface-variant file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:opacity-90"
                      />
                    </div>
                  </div>
                </div>
              )}

              {currentUser.role === 'CLIENT' && (
                <div className="pt-6 border-t border-outline col-span-2">
                  <h3 className="text-lg font-bold text-on-surface mb-2">Become a Professional</h3>
                  <p className="text-sm text-on-surface-variant mb-4">Want to offer your own services? Upgrade your account instantly.</p>
                  
                  {!showUpgradeForm ? (
                    <button type="button" onClick={() => setShowUpgradeForm(true)} className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-bold hover:bg-emerald-200 transition-colors">
                      Start Offering Services
                    </button>
                  ) : (
                    <div className="bg-surface-container-highest p-4 rounded-xl border border-outline space-y-4">
                      <div>
                        <label className="text-xs font-bold text-on-surface mb-1 block">What is your Trade?</label>
                        <input type="text" placeholder="e.g. Electrician, Tutor" value={upgradeData.trade} onChange={e => setUpgradeData({...upgradeData, trade: e.target.value})} className="w-full bg-surface border border-outline px-3 py-2 rounded-lg text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-on-surface mb-1 block">Hourly Rate (FCFA)</label>
                        <input type="number" placeholder="e.g. 2500" value={upgradeData.hourlyRate} onChange={e => setUpgradeData({...upgradeData, hourlyRate: e.target.value})} className="w-full bg-surface border border-outline px-3 py-2 rounded-lg text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
                      </div>
                      <div className="flex gap-2 justify-end">
                        <button type="button" onClick={() => setShowUpgradeForm(false)} className="px-3 py-1.5 text-xs font-bold text-on-surface-variant">Cancel</button>
                        <button type="button" onClick={handleUpgrade} disabled={upgrading} className="px-3 py-1.5 bg-primary text-on-primary rounded-lg text-xs font-bold hover:bg-opacity-90">{upgrading ? 'Upgrading...' : 'Confirm Upgrade'}</button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {success && (
                <div className="bg-emerald-50 text-emerald-700 p-3 rounded-lg text-sm font-bold flex items-center gap-2 border border-emerald-200">
                  <CheckCircle size={18} /> Settings saved successfully!
                </div>
              )}
              {errorMsg && (
                <div className="bg-rose-50 text-rose-700 p-3 rounded-lg text-sm font-bold flex items-center gap-2 border border-rose-200">
                  <X size={18} /> {errorMsg}
                </div>
              )}

              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={onClose} className="px-6 py-2 rounded-lg text-sm font-bold text-on-surface-variant hover:bg-surface-container transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="px-6 py-2 rounded-lg text-sm font-bold bg-primary text-on-primary hover:bg-opacity-90 active:scale-95 transition-all flex items-center gap-2">
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>

            </form>
          </div>
        )}

      </div>
    </div>
  );
}
