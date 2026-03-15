import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../config/supabaseConfig';
import HealaLoader from '../components/HealaLoader';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const PrescriptionView = () => {
    const { id } = useParams(); // appointment_id
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPrescription = async () => {
            try {
                // Fetch the prescription
                const { data: presData, error: presError } = await supabase
                    .from('prescriptions')
                    .select('*, doctor:doctors(*, profile:profiles(name, phone)), patient:profiles(name, phone, medical_details(age, gender)), appointment:appointments(appointment_date, appointment_time)')
                    .eq('appointment_id', id)
                    .single();

                if (presError) throw presError;
                if (!presData) throw new Error("Prescription not found.");
                
                setData(presData);
            } catch (err) {
                console.error("Error fetching prescription:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchPrescription();
    }, [id]);

    const handleDownloadPDF = async () => {
        const element = document.querySelector('.print-container');
        if (!element) return;

        try {
            const canvas = await html2canvas(element, {
                scale: 2, // Higher quality
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff'
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
            const finalWidth = imgWidth * ratio;
            const finalHeight = imgHeight * ratio;

            pdf.addImage(imgData, 'PNG', (pdfWidth - finalWidth) / 2, 0, finalWidth, finalHeight);
            pdf.save(`Prescription_${patient?.name?.replace(/\s+/g, '_') || 'Heala'}_${new Date().toLocaleDateString()}.pdf`);
        } catch (err) {
            console.error("PDF Generation error:", err);
            alert("Failed to generate PDF. Please try again.");
        }
    };

    if (loading) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><HealaLoader /></div>;
    if (error) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', fontWeight: 700 }}>{error} - It may not have been generated yet.</div>;

    const { doctor, patient, appointment } = data;
    const { medications } = data;

    return (
        <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', padding: '2rem 1rem', fontFamily: '"DM Sans", sans-serif' }}>
            <style>{`
                @media print {
                    body { background: white !important; }
                    .no-print { display: none !important; }
                    .print-container { box-shadow: none !important; margin: 0 !important; max-width: 100% !important; border: none !important; }
                }
            `}</style>

            <div className="no-print" style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 style={{ fontFamily: '"Playfair Display", serif', margin: 0, fontWeight: 800 }}>Digital Prescription</h2>
                <button 
                    onClick={handleDownloadPDF}
                    style={{ padding: '10px 20px', background: '#14b8a6', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 10px rgba(20, 184, 166, 0.3)' }}
                >
                    Download / Print PDF
                </button>
            </div>

            <div className="print-container" style={{
                maxWidth: '800px',
                margin: '0 auto',
                background: 'white',
                borderRadius: '16px',
                boxShadow: '0 20px 40px rgba(0,0,0,0.05)',
                position: 'relative',
                overflow: 'hidden',
                border: '1px solid #e2e8f0'
            }}>
                {/* Header Section */}
                <div style={{ padding: '3rem', borderBottom: '2px solid #14b8a6', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <h1 style={{ fontFamily: '"Playfair Display", serif', fontSize: '2.5rem', fontWeight: 900, color: '#0f172a', margin: '0 0 0.5rem 0' }}>{doctor?.clinic_name || 'HEALA CLINIC'}</h1>
                        <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem', fontWeight: 600 }}>{doctor?.clinic_address || 'Virtual Consultation'}</p>
                        <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '0.9rem', fontWeight: 600 }}>Ph: {doctor?.profile?.phone || 'N/A'}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <h3 style={{ margin: '0 0 0.5rem 0', color: '#0f172a', fontWeight: 800 }}>{doctor?.profile?.name || 'Practitioner'}</h3>
                        <p style={{ margin: 0, color: '#14b8a6', fontWeight: 700, fontSize: '0.85rem' }}>{doctor?.specialization}</p>
                        <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '0.8rem', fontWeight: 600 }}>{doctor?.qualification}</p>
                        <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '0.8rem', fontWeight: 600 }}>Reg: {doctor?.license_number || 'REG-PENDING'}</p>
                    </div>
                </div>

                {/* Patient Info Section */}
                <div style={{ padding: '2rem 3rem', background: '#f8fafc', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                    <div>
                        <p style={{ margin: '0 0 8px 0', fontSize: '0.75rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase' }}>Patient Details</p>
                        <h4 style={{ margin: '0 0 4px 0', fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>{patient?.name}</h4>
                        <p style={{ margin: 0, fontSize: '0.9rem', color: '#334155', fontWeight: 600 }}>
                            {patient?.medical_details?.[0]?.age ? `${patient.medical_details[0].age} Yrs` : 'Age N/A'} • {patient?.medical_details?.[0]?.gender || 'Unspecified'}
                        </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <p style={{ margin: '0 0 8px 0', fontSize: '0.75rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase' }}>Consultation Info</p>
                        <p style={{ margin: '0 0 4px 0', fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>Date: {new Date(appointment?.appointment_date || data.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                        <p style={{ margin: 0, fontSize: '0.9rem', color: '#334155', fontWeight: 600 }}>Time: {appointment?.appointment_time || ''}</p>
                    </div>
                </div>

                {/* Medical Content */}
                <div style={{ padding: '3rem', minHeight: '400px' }}>
                    <div style={{ marginBottom: '2.5rem' }}>
                        <h4 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>Diagnosis</h4>
                        <p style={{ margin: 0, fontSize: '1rem', color: '#334155', fontWeight: 600 }}>{data.diagnosis || 'General Assessment'}</p>
                    </div>

                    <div style={{ marginBottom: '2.5rem' }}>
                        <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 1.5rem 0', fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
                            <span style={{ fontSize: '1.8rem', fontFamily: '"Playfair Display", serif', color: '#14b8a6', fontStyle: 'italic', lineHeight: 1 }}>Rx</span>
                            Medications
                        </h4>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {medications && medications.length > 0 ? medications.map((med, idx) => (
                                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(20, 184, 166, 0.1)', color: '#14b8a6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.75rem', flexShrink: 0 }}>
                                        {idx + 1}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <h5 style={{ margin: '0 0 4px 0', fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>{med.name}</h5>
                                        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>
                                            <span>{/^\d+$/.test(med.duration?.trim()) ? `${med.duration.trim()} Days` : med.duration}</span>
                                            <span>•</span>
                                            <span>{med.timings}</span>
                                            <span>•</span>
                                            <span>{med.food}</span>
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <p style={{ color: '#64748b', fontStyle: 'italic' }}>No medications prescribed.</p>
                            )}
                        </div>
                    </div>

                    {data.extra_notes && (
                        <div>
                            <h4 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>Doctor's Advice / Notes</h4>
                            <p style={{ margin: 0, fontSize: '0.95rem', color: '#334155', fontWeight: 500, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{data.extra_notes}</p>
                        </div>
                    )}
                </div>

                {/* Footer / Signature Section */}
                <div style={{ padding: '2rem 3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '2rem' }}>
                    <div style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 600 }}>
                        <p style={{ margin: '0 0 4px 0' }}>This prescription is valid only if digitally or physically signed.</p>
                        <p style={{ margin: 0 }}>Generated securely by Heala Health System.</p>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontFamily: '"Playfair Display", serif', fontSize: '1.5rem', color: '#0f172a', fontStyle: 'italic', marginBottom: '0.5rem', minWidth: '150px', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
                            {data.digital_signature || doctor?.profile?.name}
                        </div>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', fontWeight: 700 }}>Signature</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrescriptionView;
