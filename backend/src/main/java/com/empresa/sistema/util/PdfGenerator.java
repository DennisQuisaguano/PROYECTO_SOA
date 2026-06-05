package com.empresa.sistema.util;

import com.empresa.sistema.dto.venta.VentaResponseDTO;
import com.empresa.sistema.dto.venta.DetalleVentaDTO;
import com.lowagie.text.*;
import com.lowagie.text.Font;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;

@Component
public class PdfGenerator {

    @Value("${app.empresa.nombre:Mi Empresa S.A.}")
    private String empresaNombre;

    @Value("${app.empresa.ruc:1234567890001}")
    private String empresaRuc;

    public byte[] generarFactura(VentaResponseDTO venta) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4, 36, 36, 36, 36);
            PdfWriter.getInstance(document, baos);
            document.open();

            // Fonts
            Font fontHeader = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, Color.BLACK);
            Font fontSubHeader = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14, Color.DARK_GRAY);
            Font fontNormal = FontFactory.getFont(FontFactory.HELVETICA, 10, Color.BLACK);
            Font fontBold = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Color.BLACK);
            Font fontWhite = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Color.WHITE);

            // 1. Encabezado
            Paragraph header = new Paragraph(empresaNombre, fontHeader);
            header.setAlignment(Element.ALIGN_CENTER);
            document.add(header);

            Paragraph ruc = new Paragraph("RUC: " + empresaRuc, fontNormal);
            ruc.setAlignment(Element.ALIGN_CENTER);
            document.add(ruc);

            // 2. Subtítulo
            document.add(new Paragraph(" "));
            Paragraph subHeader = new Paragraph("FACTURA ELECTRÓNICA", fontSubHeader);
            subHeader.setAlignment(Element.ALIGN_CENTER);
            document.add(subHeader);

            // 3. Línea separadora
            document.add(new Paragraph(" "));
            document.add(new Chunk(new com.lowagie.text.pdf.draw.LineSeparator(1f, 100f, Color.LIGHT_GRAY, Element.ALIGN_CENTER, -2f)));
            document.add(new Paragraph(" "));

            // 4. Datos Venta
            PdfPTable tableInfo = new PdfPTable(2);
            tableInfo.setWidthPercentage(100);
            
            PdfPCell cellEmpresa = new PdfPCell();
            cellEmpresa.setBorder(Rectangle.NO_BORDER);
            cellEmpresa.addElement(new Paragraph("Datos del Cliente:", fontBold));
            cellEmpresa.addElement(new Paragraph("Cédula/RUC: " + venta.getClienteCedula(), fontNormal));
            cellEmpresa.addElement(new Paragraph("Nombre: " + venta.getClienteNombre(), fontNormal));
            
            PdfPCell cellFactura = new PdfPCell();
            cellFactura.setBorder(Rectangle.NO_BORDER);
            cellFactura.setHorizontalAlignment(Element.ALIGN_RIGHT);
            cellFactura.addElement(new Paragraph("N° Factura: " + venta.getNumFac(), fontBold));
            cellFactura.addElement(new Paragraph("Fecha: " + venta.getFecha().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss")), fontNormal));
            cellFactura.addElement(new Paragraph("Sucursal: " + venta.getSucursalNombre(), fontNormal));
            
            tableInfo.addCell(cellEmpresa);
            tableInfo.addCell(cellFactura);
            document.add(tableInfo);
            document.add(new Paragraph(" "));

            // 6. Tabla Productos
            PdfPTable tableItems = new PdfPTable(4);
            tableItems.setWidthPercentage(100);
            tableItems.setWidths(new float[]{1f, 5f, 2f, 2f});

            // Cabecera Tabla
            String[] headers = {"Cant.", "Descripción", "P. Unitario", "Subtotal"};
            for (String h : headers) {
                PdfPCell cell = new PdfPCell(new Phrase(h, fontWhite));
                cell.setBackgroundColor(Color.DARK_GRAY);
                cell.setHorizontalAlignment(Element.ALIGN_CENTER);
                cell.setPadding(5);
                tableItems.addCell(cell);
            }

            // Filas
            boolean alternate = false;
            for (DetalleVentaDTO detalle : venta.getDetalles()) {
                Color bgColor = alternate ? new Color(240, 240, 240) : Color.WHITE;
                
                PdfPCell cellCant = new PdfPCell(new Phrase(String.valueOf(detalle.getCantidad()), fontNormal));
                cellCant.setHorizontalAlignment(Element.ALIGN_CENTER);
                cellCant.setBackgroundColor(bgColor);
                tableItems.addCell(cellCant);

                PdfPCell cellDesc = new PdfPCell(new Phrase(detalle.getProductoNombre(), fontNormal));
                cellDesc.setBackgroundColor(bgColor);
                tableItems.addCell(cellDesc);

                PdfPCell cellPrecio = new PdfPCell(new Phrase("$" + detalle.getPrecioUnitario().toString(), fontNormal));
                cellPrecio.setHorizontalAlignment(Element.ALIGN_RIGHT);
                cellPrecio.setBackgroundColor(bgColor);
                tableItems.addCell(cellPrecio);

                PdfPCell cellSub = new PdfPCell(new Phrase("$" + detalle.getSubtotal().toString(), fontNormal));
                cellSub.setHorizontalAlignment(Element.ALIGN_RIGHT);
                cellSub.setBackgroundColor(bgColor);
                tableItems.addCell(cellSub);

                alternate = !alternate;
            }
            document.add(tableItems);
            document.add(new Paragraph(" "));

            // 7. Totales
            PdfPTable tableTotales = new PdfPTable(2);
            tableTotales.setWidthPercentage(100);
            tableTotales.setWidths(new float[]{8f, 2f});

            addTotalRow(tableTotales, "Subtotal:", "$" + venta.getSubtotal().toString(), fontNormal);
            addTotalRow(tableTotales, "IVA:", "$" + venta.getIva().toString(), fontNormal);
            addTotalRow(tableTotales, "TOTAL:", "$" + venta.getTotal().toString(), fontBold);

            document.add(tableTotales);
            
            // 8. Pie
            document.add(new Paragraph(" "));
            document.add(new Paragraph(" "));
            Paragraph footer = new Paragraph("Gracias por su compra - " + empresaNombre, fontSubHeader);
            footer.setAlignment(Element.ALIGN_CENTER);
            document.add(footer);

            document.close();
            return baos.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Error al generar factura PDF", e);
        }
    }

    private void addTotalRow(PdfPTable table, String label, String value, Font font) {
        PdfPCell cellLabel = new PdfPCell(new Phrase(label, font));
        cellLabel.setBorder(Rectangle.NO_BORDER);
        cellLabel.setHorizontalAlignment(Element.ALIGN_RIGHT);
        table.addCell(cellLabel);

        PdfPCell cellValue = new PdfPCell(new Phrase(value, font));
        cellValue.setBorder(Rectangle.NO_BORDER);
        cellValue.setHorizontalAlignment(Element.ALIGN_RIGHT);
        table.addCell(cellValue);
    }
}