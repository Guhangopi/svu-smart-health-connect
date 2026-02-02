import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config";

const MedicalRecordsList = ({ studentId }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (studentId) {
      fetchReports();
    }
  }, [studentId]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/api/lab/reports/${studentId}`);
      setReports(res.data);
    } catch (err) {
      console.error("Error fetching reports", err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewReport = (filename) => {
    // Open file in new tab
    window.open(`/uploads/${filename}`, "_blank");
  };

  if (loading) return <div>Loading records...</div>;

  if (reports.length === 0) {
    return <p style={{ color: '#666', fontStyle: 'italic' }}>No medical records found.</p>;
  }

  return (
    <div className="table-container">
      <table className="styled-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Test Name</th>
            <th>Remarks</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {reports.map((report) => (
            <tr key={report._id}>
              <td>{report.date}</td>
              <td>{report.testName}</td>
              <td style={{ maxWidth: '300px' }}>{report.remarks || '-'}</td>
              <td>
                <button 
                    className="btn-sm btn-info"
                    onClick={() => handleViewReport(report.filename)}
                >
                    👁️ View Report
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MedicalRecordsList;
