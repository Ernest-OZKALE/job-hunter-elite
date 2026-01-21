export function applicationsToCsv(apps: any[]) {
  const headers = ['Date','Entreprise','Poste','Statut','Salaire','Lien','Fichiers','Notes'];
  const rows = apps.map(app => {
    const files = (app.attachments || []).map((a: any) => a.name).join(' | ');
    const cols = [
      app.date || '',
      `"${(app.company || '').replace(/"/g,'""')}"`,
      `"${(app.position || '').replace(/"/g,'""')}"`,
      app.status || '',
      `"${(app.salary || '')}"`,
      `"${(app.link || '')}"`,
      `"${files.replace(/"/g,'""')}"`,
      `"${(app.notes || '').replace(/"/g,'""')}"`
    ];
    return cols.join(',');
  });
  return [headers.join(','), ...rows].join('\n');
}

export default applicationsToCsv;
