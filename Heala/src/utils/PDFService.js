import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generatePrescriptionPDF = (data) => {
    const { doctor, patient, appointment, items, advice } = data;
    const doc = new jsPDF();

    // -- Header --
    doc.setFillColor(139, 92, 246); // Primary Color
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('HEALA DIGITAL PRESCRIPTION', 20, 25);
    
    doc.setFontSize(10);
    doc.text('JS CORPORATIONS • FOUNDED BY GOBIKA RANGASAMY', 20, 32);

    // -- Doctor & Patient Info --
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('DOCTOR INFO', 20, 55);
    doc.setFont('helvetica', 'normal');
    doc.text(`Dr. ${doctor.profiles?.name || 'Expert'}`, 20, 62);
    doc.text(`${doctor.specialization || 'General Surgeon'}`, 20, 67);
    doc.text(`${doctor.clinic_address || 'Heala Medical Center'}`, 20, 72);

    doc.setFont('helvetica', 'bold');
    doc.text('PATIENT INFO', 120, 55);
    doc.setFont('helvetica', 'normal');
    doc.text(`${patient.name || 'Valued Patient'}`, 120, 62);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 120, 67);
    doc.text(`Ref: #APT-${appointment.id.slice(0, 8).toUpperCase()}`, 120, 72);

    // -- Divider --
    doc.setDrawColor(230, 230, 230);
    doc.line(20, 80, 190, 80);

    // -- Medications Table --
    doc.setFont('helvetica', 'bold');
    doc.text('MEDICATIONS & DOSAGE', 20, 95);

    const tableData = items.map(item => [
        item.medicine,
        item.dosage,
        item.duration,
        item.instructions
    ]);

    autoTable(doc, {
        startY: 100,
        head: [['Medicine', 'Dosage', 'Duration', 'Instructions']],
        body: tableData,
        headStyles: { fillColor: [139, 92, 246], textColor: [255, 255, 255] },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        styles: { font: 'helvetica', fontSize: 10 }
    });

    // -- Advice Section --
    const finalY = doc.lastAutoTable.finalY + 20;
    doc.setFont('helvetica', 'bold');
    doc.text('ADDITIONAL ADVICE', 20, finalY);
    doc.setFont('helvetica', 'normal');
    
    const splitAdvice = doc.splitTextToSize(advice || 'No additional advice provided.', 170);
    doc.text(splitAdvice, 20, finalY + 10);

    // -- Footer & Signature --
    const footerY = 270;
    doc.setDrawColor(200, 200, 200);
    doc.line(140, footerY - 10, 190, footerY - 10);
    doc.setFontSize(9);
    doc.text('Digitally Signed by', 140, footerY - 5);
    doc.setFont('helvetica', 'bold');
    doc.text(`Dr. ${doctor.profiles?.name}`, 140, footerY);
    
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('This is a digitally generated prescription from Heala Platform.', 105, 285, { align: 'center' });
    doc.text('Empowered by JS Corporations • Gobika Rangasamy Vision.', 105, 290, { align: 'center' });

    // -- Save --
    doc.save(`Prescription_${patient.name.replace(/\s+/g, '_')}_${Date.now()}.pdf`);
};
