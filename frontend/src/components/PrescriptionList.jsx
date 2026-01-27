
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const PrescriptionList = ({ studentId }) => {
    const [prescriptions, setPrescriptions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!studentId) return;

        const fetchPrescriptions = async () => {
            try {
                const res = await axios.get(`/api/prescriptions/student/${studentId}`);
                setPrescriptions(res.data);
            } catch (err) {
                console.error("Error fetching prescriptions:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchPrescriptions();
    }, [studentId]);

    if (loading) return <p>Loading prescriptions...</p>;
    if (prescriptions.length === 0) return <p>No prescriptions found.</p>;

    return (
        <div>
            {prescriptions.map((scrip) => (
                <div key={scrip._id} className="content-box" style={{ borderLeft: '5px solid #0056b3', borderTop: 'none' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '10px' }}>
                        <div>
                            <strong style={{ fontSize: '1.1em', color: '#0056b3' }}>Dr. {scrip.doctorName}</strong>
                            <div style={{ fontSize: '0.9em', color: '#666' }}>{scrip.date}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <strong>Diagnosis:</strong> {scrip.diagnosis || 'N/A'}
                        </div>
                    </div>

                    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '10px' }}>
                        <thead>
                            <tr style={{ background: '#f8f9fa', textAlign: 'left' }}>
                                <th style={{ padding: '8px' }}>Medicine</th>
                                <th style={{ padding: '8px' }}>Dosage</th>
                                <th style={{ padding: '8px' }}>Freq</th>
                                <th style={{ padding: '8px' }}>Duration</th>
                            </tr>
                        </thead>
                        <tbody>
                            {scrip.medications.map((med, idx) => (
                                <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '8px' }}>{med.name}</td>
                                    <td style={{ padding: '8px' }}>{med.dosage}</td>
                                    <td style={{ padding: '8px' }}>{med.frequency}</td>
                                    <td style={{ padding: '8px' }}>{med.duration}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {scrip.notes && (
                        <div style={{ background: '#fff3cd', padding: '10px', borderRadius: '5px', fontSize: '0.9em' }}>
                            <strong>Note:</strong> {scrip.notes}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default PrescriptionList;
