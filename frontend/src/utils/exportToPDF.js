import jsPDF from 'jspdf';

export const exportToPDF = (content, filename = 'document.pdf') => {
  const doc = new jsPDF();
  
  const lines = content.split('\n');
  let y = 20;
  
  lines.forEach(line => {
    if (y > 280) {
      doc.addPage();
      y = 20;
    }
    doc.text(line, 20, y);
    y += 7;
  });
  
  doc.save(filename);
};

export const exportLessonPlanToPDF = (lessonPlan) => {
  const doc = new jsPDF();
  
  doc.setFontSize(18);
  doc.text(lessonPlan.topic, 20, 20);
  
  doc.setFontSize(12);
  doc.text(`Subject: ${lessonPlan.subject}`, 20, 35);
  doc.text(`Grade: ${lessonPlan.grade}`, 20, 42);
  
  let y = 55;
  doc.setFontSize(10);
  
  const content = typeof lessonPlan.content === 'string' 
    ? lessonPlan.content 
    : JSON.stringify(lessonPlan.content, null, 2);
  
  const lines = doc.splitTextToSize(content, 170);
  
  lines.forEach(line => {
    if (y > 280) {
      doc.addPage();
      y = 20;
    }
    doc.text(line, 20, y);
    y += 7;
  });
  
  doc.save(`lesson-plan-${lessonPlan.topic}.pdf`);
};
