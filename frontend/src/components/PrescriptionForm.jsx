
import React, { useState } from 'react';
import axios from 'axios';

const PrescriptionForm = ({ studentId, studentName, doctorId, doctorName, onSuccess, onCancel }) => {
    const [diagnosis, setDiagnosis] = useState('');
    const [notes, setNotes] = useState('');
    const [referToPharmacist, setReferToPharmacist] = useState(true); // Default to true
    const [medications, setMedications] = useState([
        { name: '', dosage: '', frequency: '', duration: '' }
    ]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleMedicationChange = (index, field, value) => {
        const newMedications = [...medications];
        newMedications[index][field] = value;
        setMedications(newMedications);
    };

    const addMedication = () => {
        setMedications([...medications, { name: '', dosage: '', frequency: '', duration: '' }]);
    };

    const removeMedication = (index) => {
        const newMedications = medications.filter((_, i) => i !== index);
        setMedications(newMedications);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        if (medications.some(med => !med.name)) {
            setError('Please ensure all medications have a name.');
            setIsSubmitting(false);
            return;
        }

        const payload = {
            studentId,
            studentName,
            doctorId,
            doctorName,
            date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
            diagnosis,
            notes,
            medications,
            referToPharmacist // Forward status
        };

        try {
            await axios.post('/api/prescriptions', payload);
            alert(`Prescription saved! ${referToPharmacist ? '(Sent to Pharmacy)' : ''}`);
            if(onSuccess) onSuccess();
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.error || 'Failed to save prescription.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="content-box" style={{ borderTopColor: '#28a745' }}>
            <h3>Write Prescription for {studentName}</h3>
            {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
            
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Diagnosis</label>
                    <input 
                        type="text" 
                        value={diagnosis} 
                        onChange={(e) => setDiagnosis(e.target.value)} 
                        placeholder="e.g. Viral Fever" 
                        required 
                    />
                </div>

                <h4>Medications</h4>
                {medications.map((med, index) => (
                    <div key={index} style={{ background: '#f9f9f9', padding: '10px', marginBottom: '10px', borderRadius: '5px', border: '1px solid #eee' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: '10px', alignItems: 'end' }}>
                            <div>
                                <label style={{fontSize: '0.85em'}}>Medicine Name</label>
                                <input 
                                    type="text" 
                                    value={med.name} 
                                    onChange={(e) => handleMedicationChange(index, 'name', e.target.value)} 
                                    placeholder="e.g. Paracetamol"
                                    required
                                />
                            </div>
                            <div>
                                <label style={{fontSize: '0.85em'}}>Dosage</label>
                                <input 
                                    type="text" 
                                    value={med.dosage} 
                                    onChange={(e) => handleMedicationChange(index, 'dosage', e.target.value)} 
                                    placeholder="500mg"
                                />
                            </div>
                            <div>
                                <label style={{fontSize: '0.85em'}}>Freq</label>
                                <input 
                                    type="text" 
                                    value={med.frequency} 
                                    onChange={(e) => handleMedicationChange(index, 'frequency', e.target.value)} 
                                    placeholder="1-0-1"
                                />
                            </div>
                            <div>
                                <label style={{fontSize: '0.85em'}}>Days</label>
                                <input 
                                    type="text" 
                                    value={med.duration} 
                                    onChange={(e) => handleMedicationChange(index, 'duration', e.target.value)} 
                                    placeholder="3 days"
                                />
                            </div>
                            {medications.length > 1 && (
                                <button type="button" onClick={() => removeMedication(index)} className="danger" style={{ padding: '8px 12px' }}>X</button>
                            )}
                        </div>
                    </div>
                ))}
                
                <button type="button" onClick={addMedication} className="secondary" style={{ marginBottom: '15px', fontSize: '0.9em' }}>+ Add Medicine</button>

                <div className="form-group">
                    <label>Additional Notes</label>
                    <textarea 
                        rows="3" 
                        value={notes} 
                        onChange={(e) => setNotes(e.target.value)} 
                        style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }}
                        placeholder="Dietary advice, rest, etc."
                    ></textarea>
                </div>

                <div className="flex-center" style={{ justifyContent: 'flex-start' }}>
                    <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                        <input 
                            type="checkbox" 
                            id="referToPharm" 
                            checked={referToPharmacist} 
                            onChange={e => setReferToPharmacist(e.target.checked)} 
                            style={{width: 'auto', margin: 0}}
                        />
                        <label htmlFor="referToPharm" style={{margin: 0, fontWeight: 'bold', color: '#28a745'}}>
                            Forward to Pharmacy?
                        </label>
                    </div>

                    <button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Saving...' : 'Save Prescription'}
                    </button>
                    {onCancel && <button type="button" className="secondary" onClick={onCancel}>Cancel</button>}
                </div>
            </form>
        </div>
    );
};

export default PrescriptionForm;
