import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { JobApplication } from '../types';

export const generatePDFReport = (applications: JobApplication[], userName: string = 'Utilisateur') => {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(22);
    doc.setTextColor(30, 41, 59);
    doc.text('JOB HUNTER - Rapport de Candidatures', 14, 20);

    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')} pour ${userName}`, 14, 28);

    // Stats Summary
    doc.setFontSize(14);
    doc.setTextColor(30, 41, 59);
    doc.text('ðŸ“Š Statistiques Globales', 14, 40);

    const stats = {
        total: applications.length,
        preparation: applications.filter(a => a.status === 'Brouillon' || a.status === 'Ã€ Postuler').length,
        candidature: applications.filter(a => a.status === 'Candidature Envoyée' || a.status === 'CV Vu' || a.status === 'En Cours d\'Examen').length,
        entretien: applications.filter(a => a.status.includes('Entretien')).length,
        offre: applications.filter(a => a.status.includes('Offre')).length,
        refus: applications.filter(a => a.status === 'Refus Entreprise' || a.status === 'Refus Candidat' || a.status === 'Ghosting').length,
    };

    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);
    let yPos = 48;
    doc.text(`Total de candidatures : ${stats.total}`, 14, yPos);
    yPos += 6;
    doc.text(`Préparation : ${stats.preparation} | Candidature : ${stats.candidature} | Entretien : ${stats.entretien}`, 14, yPos);
    yPos += 6;
    doc.text(`Offre : ${stats.offre} | Refus : ${stats.refus}`, 14, yPos);

    // Table
    const tableData = applications.map(app => [
        app.company,
        app.position,
        app.status,
        new Date(app.date).toLocaleDateString('fr-FR'),
        app.salary || '-',
        app.location || '-'
    ]);

    autoTable(doc, {
        head: [['Entreprise', 'Poste', 'Statut', 'Date', 'Salaire', 'Lieu']],
        body: tableData,
        startY: yPos + 10,
        theme: 'grid',
        headStyles: {
            fillColor: [59, 130, 246],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            fontSize: 10,
        },
        bodyStyles: {
            fontSize: 9,
            textColor: [51, 65, 85],
        },
        alternateRowStyles: {
            fillColor: [248, 250, 252],
        },
        margin: { top: 10, left: 14, right: 14 },
    });

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text(
            `Page ${i} sur ${pageCount} - Job Hunter Elite`,
            doc.internal.pageSize.getWidth() / 2,
            doc.internal.pageSize.getHeight() - 10,
            { align: 'center' }
        );
    }

    // Save
    doc.save(`JobHunter_Rapport_${new Date().toISOString().split('T')[0]}.pdf`);
};
