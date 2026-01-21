import jsPDF from 'jspdf';

export const generateRentalContract = (rental: any) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const marginX = 20;
    const contentWidth = pageWidth - (marginX * 2);
    let currentY = 20;

    // --- Helper Functions ---

    const checkPageBreak = (neededHeight: number) => {
        // Se o espaço necessário exceder a margem inferior (deixando 20mm de margem)
        if (currentY + neededHeight > pageHeight - 20) {
            doc.addPage();
            currentY = 20; // Reinicia no topo da nova página
            return true;
        }
        return false;
    };

    const addHeader = () => {
        doc.setFontSize(22);
        doc.setTextColor(0, 229, 255); // ORA Primary Cyan
        doc.text('ORA CARS', pageWidth / 2, currentY, { align: 'center' });
        currentY += 10;

        doc.setFontSize(14);
        doc.setTextColor(100);
        doc.text('CONTRATO DE LOCAÇÃO DE VEÍCULO', pageWidth / 2, currentY, { align: 'center' });
        currentY += 5;

        doc.setDrawColor(200);
        doc.line(marginX, currentY, pageWidth - marginX, currentY);
        currentY += 10;
    };

    const addSectionTitle = (title: string) => {
        checkPageBreak(12);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(0);
        doc.text(title, marginX, currentY);
        currentY += 6;
    };

    const addField = (label: string, value: string) => {
        checkPageBreak(7);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.text(label, marginX + 5, currentY);

        doc.setFont('helvetica', 'normal');
        // Calcula onde o valor começa (um pouco depois do label)
        const labelWidth = doc.getTextWidth(label);
        doc.text(value, marginX + 5 + labelWidth + 2, currentY);
        currentY += 6;
    };

    const addParagraph = (text: string) => {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9); // Texto jurídico um pouco menor
        doc.setTextColor(0);

        const lines = doc.splitTextToSize(text, contentWidth);
        const blockHeight = lines.length * 4.5;

        checkPageBreak(blockHeight + 3);

        doc.text(lines, marginX, currentY);
        currentY += blockHeight + 3;
    };

    // --- Document Generation ---

    addHeader();

    // 1. AS PARTES
    addSectionTitle('1. AS PARTES');

    // Locador
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    checkPageBreak(7);
    doc.text('LOCADOR:', marginX + 5, currentY);
    currentY += 6;

    addField('Nome:', 'José Otávio Gil Cabral');
    addField('CPF:', '437.241.872-34');
    addField('Endereço:', 'Conjunto Augusto Monte, Travessa Palmas de Monte Alto, nº 2');
    currentY += 2;

    // Locatário
    doc.setFont('helvetica', 'bold');
    checkPageBreak(7);
    doc.text('LOCATÁRIO:', marginX + 5, currentY);
    currentY += 6;

    const customerName = rental.customer_name || rental.customers?.full_name || 'Cliente';
    const customerDoc = rental.customer_document || rental.customers?.document_cpf || 'Não informado';
    const customerPhone = rental.customer_phone || rental.customers?.phone || 'Não informado';
    const customerAddress = rental.customers?.address || 'Não informado';

    addField('Nome:', customerName);
    addField('CPF:', customerDoc);
    addField('Telefone:', customerPhone);
    // Para endereço longo, usamos splitTextToSize manualmente se necessário, ou assumimos que cabe numa linha por enquanto
    // Se quiser ser robusto para um endereço muito longo:
    const addressLines = doc.splitTextToSize(customerAddress, contentWidth - 25); // descontando label
    if (addressLines.length > 1) {
        doc.setFont('helvetica', 'bold'); doc.text('Endereço:', marginX + 5, currentY);
        doc.setFont('helvetica', 'normal'); doc.text(addressLines, marginX + 25, currentY);
        currentY += (addressLines.length * 5) + 2;
    } else {
        addField('Endereço:', customerAddress);
    }

    currentY += 4;

    // 2. O VEÍCULO
    addSectionTitle('2. O VEÍCULO');
    addField('Modelo/Marca:', `${rental.cars?.brand || ''} ${rental.cars?.model || 'Veículo'}`);
    addField('Placa:', rental.cars?.license_plate || 'S/P');
    currentY += 4;

    // 3. PRAZO E VALORES
    addSectionTitle('3. PRAZO E VALORES');
    addField('Início:', new Date(rental.start_date).toLocaleDateString());
    addField('Término:', new Date(rental.end_date).toLocaleDateString());
    addField('Valor Total:', `R$ ${rental.total_amount?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
    addField('Valor Pago:', `R$ ${rental.paid_amount?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}`);
    currentY += 8;

    // --- Cláusulas Jurídicas Completas ---

    addSectionTitle('4. DO OBJETO');
    addParagraph('O presente contrato tem como objeto a locação do veículo automotor descrito no item 2, de propriedade do LOCADOR, para uso exclusivo do LOCATÁRIO, sendo vedada a sublocação ou empréstimo a terceiros sem prévia autorização por escrito.');

    addSectionTitle('5. DAS OBRIGAÇÕES DO LOCADOR');
    addParagraph('I - Entregar o veículo ao LOCATÁRIO em perfeitas condições de funcionamento e segurança, com todos os equipamentos exigidos pelo Código de Trânsito Brasileiro.');
    addParagraph('II - Garantir ao LOCATÁRIO o uso pacífico do veículo durante a vigência do contrato.');
    addParagraph('III - Prestar assistência em caso de defeito mecânico oriundo do desgaste natural do veículo, desde que não causado por mau uso.');

    addSectionTitle('6. DAS OBRIGAÇÕES DO LOCATÁRIO');
    addParagraph('I - Utilizar o veículo de acordo com as normas de trânsito e para os fins a que se destina, zelando pela sua conservação e limpeza.');
    addParagraph('II - Não ceder, sublocar ou emprestar o veículo a terceiros sem consentimento expresso do LOCADOR.');
    addParagraph('III - Devolver o veículo na data estipulada e nas mesmas condições em que o recebeu, ressalvado o desgaste natural pelo uso.');
    addParagraph('IV - Abastecer o veículo com combustível de boa qualidade.');
    addParagraph('V - Comunicar imediatamente ao LOCADOR qualquer avaria, acidente ou defeito apresentado pelo veículo.');

    addSectionTitle('7. DAS MULTAS E INFRAÇÕES');
    addParagraph('O LOCATÁRIO declara-se o principal condutor e responsável civil e criminalmente por quaisquer infrações de trânsito ocorridas durante o período de locação. Caso o LOCADOR receba notificação de multa referente ao período, o LOCATÁRIO obriga-se a efetuar o reembolso imediato do valor, bem como a pontuação em sua CNH, se aplicável.');

    addSectionTitle('8. DO SEGURO E SINISTROS');
    addParagraph('Em caso de acidente, furto ou roubo, o LOCATÁRIO deverá acionar as autoridades competentes (Boletim de Ocorrência) e comunicar o LOCADOR imediatamente. O LOCATÁRIO será responsável pelo pagamento da franquia do seguro, caso acionado. Se o dano for inferior à franquia, o LOCATÁRIO arcará integralmente com o custo do reparo.');

    addSectionTitle('9. DO ATRASO NA DEVOLUÇÃO');
    addParagraph('A não devolução do veículo na data e hora estipuladas sujeitará o LOCATÁRIO ao pagamento de diárias adicionais, calculadas com base no valor vigente, acrescidas de multa de 10% sobre o valor total do débito, sem prejuízo de o LOCADOR tomar as medidas judiciais cabíveis para reintegração de posse.');

    addSectionTitle('10. DA RESCISÃO');
    addParagraph('O presente contrato poderá ser rescindido por qualquer das partes mediante aviso prévio, ou imediatamente em caso de descumprimento de qualquer cláusula aqui estabelecida. O LOCADOR poderá exigir a devolução imediata do veículo se constatar uso indevido.');

    addSectionTitle('11. DO FORO');
    addParagraph('As partes elegem o foro da comarca local para dirimir quaisquer dúvidas ou controvérsias oriundas deste contrato, com renúncia expressa a qualquer outro, por mais privilegiado que seja.');

    currentY += 10;

    // Assinaturas
    checkPageBreak(40); // Garante que as assinaturas não fiquem quebradas ou sozinhas no topo

    addParagraph('E, por estarem assim justos e contratados, assinam o presente instrumento em duas vias de igual teor.');
    currentY += 15;

    // Linhas de assinatura
    const signatureY = currentY;

    // Locador
    doc.line(25, signatureY, 90, signatureY);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('LOCADOR', 35, signatureY + 5);
    doc.setFontSize(8);
    doc.text('José Otávio Gil Cabral', 35, signatureY + 9);

    // Locatário
    doc.line(120, signatureY, 185, signatureY);
    doc.setFontSize(10);
    doc.text('LOCATÁRIO', 130, signatureY + 5);
    doc.setFontSize(8);
    // Pode ser que o nome seja longo, vamos truncar ou deixar passar
    const safeCustomerName = customerName.length > 25 ? customerName.substring(0, 25) + '...' : customerName;
    doc.text(safeCustomerName, 130, signatureY + 9);


    // Footer em todas as páginas
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`Página ${i} de ${totalPages} - Gerado em ${new Date().toLocaleDateString()}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
    }

    // --- Finalização ---
    try {
        const cleanName = (customerName || 'Cliente').normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const cleanCar = (rental.cars?.model || 'Carro').normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const fileName = `contrato_completo_${cleanName}_${cleanCar}.pdf`;

        doc.save(fileName);
        alert('Contrato Jurídico COMPLETO (Oficial) gerado com sucesso!');
    } catch (err) {
        console.error('Erro ao salvar PDF:', err);
        try {
            window.open(doc.output('bloburl'), '_blank');
        } catch (e) {
            alert('Erro ao gerar PDF. Verifique o console.');
        }
    }
};
