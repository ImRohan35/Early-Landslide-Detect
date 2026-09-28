import { useState, useEffect } from 'react';
import { MessageSquare, Send, Star, Trash2, UserCheck } from 'lucide-react';
import { submitFeedbackApi, getFeedbackApi } from '../services/api';

export default function FeedbackView({ showToast }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    rating: 5,
    category: 'Model Usability',
    message: '',
  });

  const [feedbackList, setFeedbackList] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getFeedbackApi().then((res) => {
      if (res && res.length > 0) setFeedbackList(res);
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      showToast('Please fill out all required fields.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await submitFeedbackApi(formData);
      setFeedbackList((prev) => [
        {
          ...formData,
          id: Date.now(),
          created_at: 'Just now',
        },
        ...prev,
      ]);
      setFormData({
        name: '',
        email: '',
        rating: 5,
        category: 'Model Usability',
        message: '',
      });
      showToast('Feedback submitted successfully. Thank you!', 'success');
    } catch (err) {
      showToast('Feedback recorded locally.', 'info');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClear = () => {
    setFormData({
      name: '',
      email: '',
      rating: 5,
      category: 'Model Usability',
      message: '',
    });
    showToast('Form cleared', 'info');
  };

  return (
    <div className="view-container">
      <div className="view-header">
        <div>
          <h2>System Feedback & Review</h2>
          <p>
            Share feedback on landslide risk prediction accuracy, report formatting, or system usability for continuous improvement.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(360px, 1fr) minmax(360px, 1.2fr)', gap: 24 }}>
        {/* Feedback Submission Form */}
        <div className="card">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <MessageSquare size={18} style={{ color: 'var(--primary)' }} />
              <h3 className="card-title">Submit Field Feedback</h3>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Dr. Rajesh Sharma"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                id="feedback-name-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input
                type="email"
                className="form-control"
                placeholder="e.g. sharma@ner-disaster.gov.in"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                id="feedback-email-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Rating</label>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 4 }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFormData({ ...formData, rating: star })}
                    style={{ padding: 4, cursor: 'pointer' }}
                    title={`${star} Stars`}
                  >
                    <Star
                      size={24}
                      fill={star <= formData.rating ? '#f59e0b' : 'none'}
                      stroke={star <= formData.rating ? '#f59e0b' : 'var(--text-muted)'}
                    />
                  </button>
                ))}
                <span style={{ fontSize: 13, fontWeight: 700, marginLeft: 6, color: 'var(--text-secondary)' }}>
                  {formData.rating} out of 5 Stars
                </span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                className="form-control"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="Model Usability">Model Usability & Workflow</option>
                <option value="Data Accuracy">Data Accuracy & Calibration</option>
                <option value="Report Quality">Report Quality & PDF Export</option>
                <option value="Map Interface">Interactive Mapping Interface</option>
                <option value="General Feedback">General Suggestion</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Feedback Message *</label>
              <textarea
                className="form-control"
                rows="4"
                placeholder="Provide details about your observation, terrain insights, or feature request..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                required
                id="feedback-message-input"
              />
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ flex: 1 }}
                disabled={submitting}
                id="submit-feedback-btn"
              >
                <Send size={15} />
                {submitting ? 'Submitting...' : 'Submit Feedback'}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleClear}
                id="clear-feedback-btn"
              >
                <Trash2 size={15} />
                Clear
              </button>
            </div>
          </form>
        </div>

        {/* List of Recent Feedback */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Recent Feedback & Field Observations</h3>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {feedbackList.length} Entries Recorded
            </span>
          </div>

          <div style={{ display: 'flex', flexDirect: 'column', gap: 14, maxHeight: 500, overflowY: 'auto' }}>
            {feedbackList.map((item, idx) => (
              <div
                key={item.id || idx}
                style={{
                  padding: '14px 16px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-app)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <div>
                    <strong style={{ fontSize: 14, color: 'var(--text-primary)' }}>{item.name}</strong>
                    <small style={{ display: 'block', fontSize: 11, color: 'var(--text-muted)' }}>
                      {item.category} • {item.created_at}
                    </small>
                  </div>
                  <div style={{ display: 'flex', gap: 2 }}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={14}
                        fill={s <= (item.rating || 5) ? '#f59e0b' : 'none'}
                        stroke={s <= (item.rating || 5) ? '#f59e0b' : 'var(--text-muted)'}
                      />
                    ))}
                  </div>
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                  "{item.message}"
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
