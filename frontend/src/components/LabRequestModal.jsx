import React, { useState } from 'react';
import axios from 'axios';

const LabRequestModal = ({ studentId, studentName, doctorId, doctorName, onSuccess, onCancel }) => {
    const [testType, setTestType] = useState('Blood Test');
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            await axios.post('/api/lab/request', {
                studentId,
                studentName,
                doctorId,
                doctorName,
                testType,
                notes
            });
            alert('Lab Request Sent Successfully!');
            if (onSuccess) onSuccess();
        } catch (err) {
            console.error(err);
            alert('Failed to send lab request.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 3000
        }}>
            <div style={{
                backgroundColor: 'white', padding: '25px', borderRadius: '12px', width: '90%', maxWidth: '500px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
            }}>
                <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '20px'}}>
                    <h3 style={{margin: 0}}>🧪 New Lab Request</h3>
                    <button onClick={onCancel} style={{border: 'none', background: 'none', fontSize: '1.2em', cursor: 'pointer'}}>✕</button>
                </div>
                
                <p><strong>Patient:</strong> {studentName} (ID: {studentId})</p>

                <form onSubmit={handleSubmit}>
                    <div className="form-group" style={{marginBottom: '15px'}}>
                        <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>Test Type</label>
                        <select 
                            value={testType} 
                            onChange={(e) => setTestType(e.target.value)}
                            style={{width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc'}}
                        >
                            <option value="Blood Test">Blood Test (CBC)</option>
                            <option value="Urine Analysis">Urine Analysis</option>
                            <option value="X-Ray">X-Ray</option>
                            <option value="MRI Scan">MRI Scan</option>
                            <option value="CT Scan">CT Scan</option>
                            <option value="Sugar Test">Blood Sugar (Fasting/PP)</option>
                            <option value="Lipid Profile">Lipid Profile</option>
                        </select>
                    </div>

                    <div className="form-group" style={{marginBottom: '20px'}}>
                        <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>Clinical Notes</label>
                        <textarea 
                            rows="3" 
                            value={notes} 
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Specific instructions for Lab Technician..."
                            style={{width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc'}}
                        />
                    </div>

                    <div style={{display: 'flex', justifyContent: 'flex-end', gap: '10px'}}>
                        <button type="button" onClick={onCancel} style={{padding: '10px 20px', borderRadius: '6px', border: 'none', background: '#e0e0e0', cursor: 'pointer'}}>Cancel</button>
                        <button 
                            type="submit" 
                            disabled={isSubmitting}
                            style={{padding: '10px 20px', borderRadius: '6px', border: 'none', background: '#6f42c1', color: 'white', cursor: 'pointer'}}
                        >
                            {isSubmitting ? 'Sending...' : 'Send Request'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LabRequestModal;
