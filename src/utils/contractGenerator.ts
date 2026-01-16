import jsPDF from 'jspdf';

export const generateRentalContract = (rental: any) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header
    doc.setFontSize(22);
    doc.setTextColor(0, 229, 255); // ORA Primary Cyan
    doc.text('ORA CARS', pageWidth / 2, 20, { align: 'center' });

    doc.setFontSize(14);
    doc.setTextColor(100);
    doc.text('CONTRATO DE LOCAÇÃO DE VEÍCULO', pageWidth / 2, 30, { align: 'center' });

    // Divider
    doc.setDrawColor(200);
    doc.line(20, 35, pageWidth - 20, 35);

    // Content Sections
    doc.setFontSize(12);
    doc.setTextColor(0);

    // 1. Parties
    doc.setFont('helvetica', 'bold');
    doc.text('1. AS PARTES', 20, 45);
    doc.setFont('helvetica', 'normal');
    doc.text(`LOCADORA: ORA CARS - Gestão de Frotas`, 25, 52);
    doc.text(`LOCATÁRIO: ${rental.customer_name || rental.customers?.full_name || 'Cliente'}`, 25, 59);
    doc.text(`DOCUMENTO: ${rental.customer_document || rental.customers?.document_cpf || 'Não informado'}`, 25, 66);
    doc.text(`CONTATO: ${rental.customer_phone || rental.customers?.phone || 'Não informado'}`, 25, 73);

    // 2. Vehicle
    doc.setFont('helvetica', 'bold');
    doc.text('2. O VEÍCULO', 20, 85);
    doc.setFont('helvetica', 'normal');
    doc.text(`MODELO/MARCA: ${rental.cars?.brand || ''} ${rental.cars?.model || 'Veículo'}`, 25, 92);
    doc.text(`PLACA: ${rental.cars?.license_plate || 'S/P'}`, 25, 99);

    // 3. Rental Details
    doc.setFont('helvetica', 'bold');
    doc.text('3. PRAZO E VALORES', 20, 110);
    doc.setFont('helvetica', 'normal');
    doc.text(`INÍCIO: ${new Date(rental.start_date).toLocaleDateString()}`, 25, 117);
    doc.text(`TÉRMINO: ${new Date(rental.end_date).toLocaleDateString()}`, 25, 124);
    doc.text(`VALOR TOTAL: R$ ${rental.total_amount}`, 25, 131);
    doc.text(`VALOR PAGO: R$ ${rental.paid_amount || 0}`, 25, 138);

    // Clauses
    doc.setFont('helvetica', 'bold');
    doc.text('4. CLÁUSULAS PRINCIPAIS', 20, 150);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const clauses = [
        'O veículo deve ser entregue nas mesmas condições de limpeza e combustível.',
        'Multas de trânsito ocorridas no período são de responsabilidade do locatário.',
        'Em caso de sinistro, a franquia do seguro deverá ser paga pelo locatário.',
        'Atrasos na devolução acarretarão em multas diárias.'
    ];
    clauses.forEach((clause, index) => {
        doc.text(`• ${clause}`, 25, 157 + (index * 6));
    });

    // Signatures
    doc.setFontSize(12);
    doc.line(25, 240, 90, 240);
    doc.text('Assinatura Locadora', 35, 245);

    doc.line(120, 240, 185, 240);
    doc.text('Assinatura Locatário', 130, 245);

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(`Gerado em: ${new Date().toLocaleString()} - ORA Cars Management System`, pageWidth / 2, 285, { align: 'center' });

    // Finalização e Download
    try {
        // Limpeza extrema do nome do arquivo (remove acentos e caracteres especiais)
        const customerName = (rental.customer_name || 'Cliente').normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const carInfo = (rental.cars?.model || 'Carro').normalize("NFD").replace(/[\u0300-\u036f]/g, "");

        const safeName = customerName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const safeCar = carInfo.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const fileName = `contrato_${safeName}_${safeCar}.pdf`;

        console.log('Tentando salvar PDF:', fileName);

        // Retornamos ao método nativo .save() que é mais compatível se o nome estiver limpo
        doc.save(fileName);

        // Feedback visual para o usuário saber que algo aconteceu
        alert('Contrato gerado com sucesso! Verifique sua pasta de downloads.');
    } catch (err) {
        console.error('Erro crítico na geração do PDF:', err);
        // Fallback final: abre em nova aba/janela
        try {
            window.open(doc.output('bloburl'), '_blank');
            alert('Atenção: O download automático falhou, mas o contrato foi aberto em uma nova aba.');
        } catch (linkErr) {
            alert('Erro ao gerar contrato. Por favor, contate o suporte.');
        }
    }
};
