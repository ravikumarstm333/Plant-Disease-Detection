import React, { useState } from 'react';
import { adminAPI } from '../../services/api';
import { toast } from 'react-hot-toast';
import './admin-manager-create.css';

const AdminManagerCreate = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', location: '', phone: '' });
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await adminAPI.createManager(form);
      toast.success('Manager created');
      setForm({ name: '', email: '', password: '', location: '', phone: '' });
    } catch (e2) {
      toast.error(e2.response?.data?.error || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-manager-page">
      <div className="admin-manager-shell">
        <div className="admin-manager-header">
          <span className="admin-kicker">Admin Control</span>
          <h1>Manager Access Dashboard</h1>
          <p>Create and activate market manager accounts from one place.</p>
        </div>

        <form className="admin-manager-form" onSubmit={submit}>
          <div className="admin-grid">
            <label>
              Full Name
              <input
                placeholder="Enter manager name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </label>
            <label>
              Email Address
              <input
                type="email"
                placeholder="manager@email.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </label>
            <label>
              Temporary Password
              <input
                placeholder="Set initial password"
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </label>
            <label>
              Location
              <input
                placeholder="City / Market Area"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                required
              />
            </label>
            <label className="span-2">
              Phone Number
              <input
                placeholder="+91 98765 43210"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                required
              />
            </label>
          </div>

          <button type="submit" disabled={loading}>
            {loading ? 'Creating Manager...' : 'Create Manager Account'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminManagerCreate;
