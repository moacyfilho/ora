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
        if (currentY + neededHeight > pageHeight - 20) {
            doc.addPage();
            currentY = 20;
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
        const labelWidth = doc.getTextWidth(label);
        doc.text(value, marginX + 5 + labelWidth + 2, currentY);
        currentY += 6;
    };

    const addParagraph = (text: string) => {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
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

    const addressLines = doc.splitTextToSize(customerAddress, contentWidth - 25);
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

    // --- Cláusulas Jurídicas Blindadas ---

    addSectionTitle('4. DO OBJETO');
    addParagraph('O presente contrato tem como objeto a locação do veículo automotor descrito no item 2, de propriedade do LOCADOR, para uso exclusivo e pessoal do LOCATÁRIO, sendo terminantemente vedada a sublocação, empréstimo, cessão a terceiros ou utilização para transporte clandestino de passageiros ou cargas.');

    addSectionTitle('5. DAS OBRIGAÇÕES DO LOCADOR');
    addParagraph('I - Entregar o veículo ao LOCATÁRIO em perfeitas condições de funcionamento, segurança e limpeza.');
    addParagraph('II - Garantir ao LOCATÁRIO o uso pacífico do veículo durante a vigência do contrato, salvo em casos de reintegração de posse por inadimplemento.');

    addSectionTitle('6. DAS OBRIGAÇÕES DO LOCATÁRIO');
    addParagraph('I - Guardar e zelar pelo veículo como se fosse seu, respondendo por quaisquer danos causados, inclusive arranhões, mossas e rasgos no estofamento.');
    addParagraph('II - Não ceder a direção do veículo a terceiros não autorizados no contrato.');
    addParagraph('III - Realizar conferência diária de água e óleo, responsabilizando-se por danos ao motor decorrentes de negligência (fundição de motor).');
    addParagraph('IV - Comunicar imediatamente ao LOCADOR qualquer anomalia no funcionamento do veículo.');

    addSectionTitle('7. DA APROPRIAÇÃO INDÉBITA');
    addParagraph('A não devolução do veículo na data e hora estipuladas, sem comunicação prévia e autorização expressa de prorrogação pelo LOCADOR, por período superior a 24 (vinte e quatro) horas, configurará crime de APROPRIAÇÃO INDÉBITA (Art. 168 do Código Penal). Nesta hipótese, o LOCADOR fica autorizado a promover o bloqueio imediato do veículo, registrar Boletim de Ocorrência policial e requerer judicialmente a Busca e Apreensão, arcando o LOCATÁRIO com todas as custas judiciais, honorários advocatícios e despesas de recuperação do bem.');

    addSectionTitle('8. DO BLOQUEIO E RASTREAMENTO');
    addParagraph('O LOCATÁRIO declara ter plena ciência de que o veículo locado está equipado com sistema de rastreamento via satélite e dispositivo de bloqueio remoto. O LOCADOR reserva-se o direito de monitorar o deslocamento do veículo e efetuar o bloqueio do funcionamento do motor em casos de: a) Inadimplência superior a 24 horas; b) Saída do perímetro territorial autorizado (se houver); c) Suspeita de fraude ou apropriação indébita; d) Não devolução na data contratada.');

    addSectionTitle('9. DA DEVOLUÇÃO E HIGIENIZAÇÃO');
    addParagraph('O veículo deverá ser devolvido com o mesmo nível de combustível verificado na entrega e em condições ideais de limpeza interna e externa. Caso o veículo seja devolvido sujo, será cobrada taxa de lavagem variando de R$ 50,00 a R$ 200,00 (lavagem especial), dependendo do estado. Diferenças de combustível serão cobradas com base no preço de mercado acrescido de taxa de reabastecimento de 20%.');

    addSectionTitle('10. DAS MULTAS E INFRAÇÕES');
    addParagraph('O LOCATÁRIO declara-se o principal condutor e assume total responsabilidade civil, administrativa e criminal por quaisquer infrações de trânsito cometidas durante o período de locação, independentemente de quem estiver na direção. O LOCATÁRIO autoriza o LOCADOR a indicar seu nome como condutor infrator perante os órgãos de trânsito e obriga-se a reembolsar imediatamente o valor das multas, acrescido de 10% a título de taxa administrativa.');

    addSectionTitle('11. DO SEGURO, SINISTROS E LUCROS CESSANTES');
    addParagraph('Em caso de colisão, furto, roubo ou incêndio, o LOCATÁRIO deverá comunicar o fato ao LOCADOR imediatamente e providenciar o Boletim de Ocorrência. O LOCATÁRIO será responsável pelo pagamento da franquia do seguro. Além disso, o LOCATÁRIO responderá por LUCROS CESSANTES, comprometendo-se a pagar ao LOCADOR o valor correspondente às diárias de locação pelo período em que o veículo permanecer parado em oficina para reparos ou indisponível para uso, limitado a 30 dias.');

    addSectionTitle('12. DO ATRASO NA DEVOLUÇÃO');
    addParagraph('O atraso na devolução do veículo implicará na cobrança de diárias adicionais ("pro rata"), acrescidas de multa moratória de 10% sobre o valor total do débito.');

    addSectionTitle('13. DA RESCISÃO');
    addParagraph('O contrato será rescindido de pleno direito em caso de descumprimento de qualquer de suas cláusulas, falência ou insolvência das partes, ou uso criminoso do veículo, sem prejuízo da cobrança das perdas e danos.');

    addSectionTitle('14. DO FORO');
    addParagraph('Fica eleito o foro da comarca de domicílio do LOCADOR para dirimir quaisquer dúvidas ou litígios oriundos deste contrato, renunciando as partes a qualquer outro, por mais privilegiado que seja.');

    currentY += 10;

    // Assinaturas
    checkPageBreak(40);

    addParagraph('E, por estarem assim justos e contratados, inclusive quanto às cláusulas de bloqueio e apropriação indébita, assinam o presente instrumento em duas vias.');
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
    const safeCustomerName = customerName.length > 25 ? customerName.substring(0, 25) + '...' : customerName;
    doc.text(safeCustomerName, 130, signatureY + 9);


    // Footer
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`Página ${i} de ${totalPages} - Gerado em ${new Date().toLocaleDateString()} - ORA Cars Blindado`, pageWidth / 2, pageHeight - 10, { align: 'center' });
    }

    // --- Finalização ---
    try {
        const cleanName = (customerName || 'Cliente').normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const cleanCar = (rental.cars?.model || 'Carro').normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const fileName = `contrato_blindado_${cleanName}_${cleanCar}.pdf`;

        doc.save(fileName);
        alert('Contrato BLINDADO (Proteção Total) gerado com sucesso!');
    } catch (err) {
        console.error('Erro ao salvar PDF:', err);
        try {
            window.open(doc.output('bloburl'), '_blank');
        } catch (e) {
            alert('Erro ao gerar PDF.');
        }
    }
};
