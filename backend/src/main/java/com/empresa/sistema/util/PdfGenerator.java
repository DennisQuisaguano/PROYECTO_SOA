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
            Document document = new Document(PageSize.A4, 30, 30, 30, 30);
            PdfWriter.getInstance(document, baos);
            document.open();

            // Colors
            Color maroonColor = new Color(107, 26, 51); // #6B1A33
            Color borderGray = new Color(203, 213, 225); // #cbd5e1
            Color bgLight = new Color(248, 250, 252); // #f8fafc

            // Fonts
            Font fontLogo = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14, Color.WHITE);
            Font fontMaroonTitle = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 13, maroonColor);
            Font fontRuc = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11, Color.BLACK);
            Font fontFacturaLabel = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, Color.BLACK);
            Font fontInvoiceNo = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11, maroonColor);
            Font fontAccessKeyLabel = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 7, Color.DARK_GRAY);
            Font fontAccessKey = FontFactory.getFont(FontFactory.COURIER_BOLD, 7, Color.BLACK);
            Font fontLabel = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8, Color.BLACK);
            Font fontValue = FontFactory.getFont(FontFactory.HELVETICA, 8, Color.BLACK);
            Font fontNormal = FontFactory.getFont(FontFactory.HELVETICA, 9, Color.BLACK);
            Font fontBold = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, Color.BLACK);
            Font fontWhite = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, Color.WHITE);
            Font fontMaroonTotal = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11, maroonColor);

            // ==================== 1. ENCABEZADO (2 PANELS) ====================
            PdfPTable headerTable = new PdfPTable(2);
            headerTable.setWidthPercentage(100);
            headerTable.setWidths(new float[]{1f, 1.25f});

            // Panel Izquierdo (Info Negocio)
            PdfPCell leftCell = new PdfPCell();
            leftCell.setBorder(Rectangle.BOX);
            leftCell.setBorderColor(borderGray);
            leftCell.setPadding(12);

            // Icon box placeholder
            PdfPTable logoBox = new PdfPTable(1);
            logoBox.setWidthPercentage(25);
            PdfPCell innerLogoCell = new PdfPCell(new Phrase("POS", fontLogo));
            innerLogoCell.setBackgroundColor(maroonColor);
            innerLogoCell.setHorizontalAlignment(Element.ALIGN_CENTER);
            innerLogoCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
            innerLogoCell.setPadding(6);
            innerLogoCell.setBorder(Rectangle.NO_BORDER);
            logoBox.addCell(innerLogoCell);
            leftCell.addElement(logoBox);

            Paragraph blankSpace1 = new Paragraph(" ");
            blankSpace1.setLeading(6f);
            leftCell.addElement(blankSpace1);

            Paragraph titlePara = new Paragraph(venta.getSucursalNombre() != null ? venta.getSucursalNombre().toUpperCase() : empresaNombre.toUpperCase(), fontMaroonTitle);
            titlePara.setAlignment(Element.ALIGN_CENTER);
            leftCell.addElement(titlePara);

            Paragraph dirPara = new Paragraph("Dirección Matriz: Calle Principal y Secundaria", fontValue);
            dirPara.setAlignment(Element.ALIGN_CENTER);
            leftCell.addElement(dirPara);

            Paragraph telPara = new Paragraph("Teléfono: 0999 999 999", fontValue);
            telPara.setAlignment(Element.ALIGN_CENTER);
            leftCell.addElement(telPara);

            Paragraph contPara = new Paragraph("OBLIGADO A LLEVAR CONTABILIDAD: NO", fontValue);
            contPara.setAlignment(Element.ALIGN_CENTER);
            leftCell.addElement(contPara);

            // Panel Derecho (Info Factura)
            PdfPCell rightCell = new PdfPCell();
            rightCell.setBorder(Rectangle.BOX);
            rightCell.setBorderColor(borderGray);
            rightCell.setPadding(12);

            Paragraph rucPara = new Paragraph("R.U.C.: " + (empresaRuc != null ? empresaRuc : "9999999999001"), fontRuc);
            rightCell.addElement(rucPara);

            Paragraph typePara = new Paragraph("F A C T U R A", fontFacturaLabel);
            rightCell.addElement(typePara);

            Paragraph noPara = new Paragraph("No. " + venta.getNumFac(), fontInvoiceNo);
            rightCell.addElement(noPara);

            Paragraph keyLabelPara = new Paragraph("NÚMERO DE AUTORIZACIÓN / CLAVE DE ACCESO", fontAccessKeyLabel);
            rightCell.addElement(keyLabelPara);

            // Generate access key
            String dateStr = venta.getFecha().format(DateTimeFormatter.ofPattern("ddMMyyyy"));
            String cleanNum = venta.getNumFac().replaceAll("[^0-9]", "");
            if (cleanNum.length() > 9) {
                cleanNum = cleanNum.substring(cleanNum.length() - 9);
            } else if (!cleanNum.isEmpty()) {
                cleanNum = String.format("%09d", Long.parseLong(cleanNum));
            } else {
                cleanNum = "000000001";
            }
            String accessKey = dateStr + "0199999999990012001001" + cleanNum + "123456781";

            PdfPTable keyTable = new PdfPTable(1);
            keyTable.setWidthPercentage(100);
            PdfPCell keyCell = new PdfPCell(new Phrase(accessKey, fontAccessKey));
            keyCell.setBackgroundColor(bgLight);
            keyCell.setBorder(Rectangle.BOX);
            keyCell.setBorderColor(borderGray);
            keyCell.setPadding(5);
            keyCell.setHorizontalAlignment(Element.ALIGN_CENTER);
            keyTable.addCell(keyCell);
            rightCell.addElement(keyTable);

            Paragraph blankSpace2 = new Paragraph(" ");
            blankSpace2.setLeading(6f);
            rightCell.addElement(blankSpace2);

            // Grid values with custom bottom border lines
            PdfPTable gridTable = new PdfPTable(2);
            gridTable.setWidthPercentage(100);
            gridTable.setWidths(new float[]{1.2f, 1.8f});

            addGridRow(gridTable, "FECHA Y HORA:", venta.getFecha().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss")), fontLabel, fontValue, borderGray);
            addGridRow(gridTable, "AMBIENTE:", "PRODUCCIÓN", fontLabel, fontValue, borderGray);
            addGridRow(gridTable, "EMISIÓN:", "NORMAL", fontLabel, fontValue, borderGray);
            addGridRow(gridTable, "CAJERO:", venta.getCajeroNombre() != null ? venta.getCajeroNombre().toUpperCase() : "CAJERO", fontLabel, fontValue, borderGray);
            addGridRow(gridTable, "ESTADO:", venta.getEstado(), fontLabel, fontValue, borderGray);

            rightCell.addElement(gridTable);

            headerTable.addCell(leftCell);
            headerTable.addCell(rightCell);
            document.add(headerTable);
            document.add(new Paragraph(" "));

            // ==================== 2. DATOS CLIENTE ====================
            PdfPTable clientOuterTable = new PdfPTable(1);
            clientOuterTable.setWidthPercentage(100);
            PdfPCell clientOuterCell = new PdfPCell();
            clientOuterCell.setBorder(Rectangle.BOX);
            clientOuterCell.setBorderColor(borderGray);
            clientOuterCell.setPadding(10);

            PdfPTable clientTable = new PdfPTable(2);
            clientTable.setWidthPercentage(100);
            clientTable.setWidths(new float[]{1.5f, 1f});

            addClientField(clientTable, "CLIENTE:", venta.getClienteNombre() != null ? venta.getClienteNombre().toUpperCase() : "", fontLabel, fontValue);
            addClientField(clientTable, "IDENTIFICACIÓN:", venta.getClienteCedula(), fontLabel, fontValue);
            addClientField(clientTable, "TELÉFONO:", venta.getClienteTelefono() != null ? venta.getClienteTelefono() : "N/A", fontLabel, fontValue);
            addClientField(clientTable, "FECHA EMISIÓN:", venta.getFecha().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss")), fontLabel, fontValue);
            addClientFieldColspan(clientTable, "DIRECCIÓN:", venta.getClienteDireccion() != null ? venta.getClienteDireccion().toUpperCase() : "N/A", fontLabel, fontValue);
            addClientFieldColspan(clientTable, "CORREO:", venta.getClienteEmail() != null ? venta.getClienteEmail() : "N/A", fontLabel, fontValue);

            clientOuterCell.addElement(clientTable);
            clientOuterTable.addCell(clientOuterCell);
            document.add(clientOuterTable);
            document.add(new Paragraph(" "));

            // ==================== 3. TABLA DE PRODUCTOS ====================
            PdfPTable tableItems = new PdfPTable(5);
            tableItems.setWidthPercentage(100);
            tableItems.setWidths(new float[]{1.2f, 1f, 5.3f, 1.25f, 1.25f});

            // Headers
            String[] headers = {"Cod.", "Cant", "Descripción", "P. Unitario", "Total"};
            for (String h : headers) {
                PdfPCell cell = new PdfPCell(new Phrase(h, fontBold));
                cell.setBackgroundColor(Color.WHITE);
                cell.setBorderColor(borderGray);
                cell.setHorizontalAlignment(Element.ALIGN_CENTER);
                cell.setPadding(8);
                tableItems.addCell(cell);
            }

            // Body
            for (DetalleVentaDTO detalle : venta.getDetalles()) {
                String code = detalle.getProductoId() != null ? detalle.getProductoId() : "0001";
                if (code.length() > 4) {
                    code = code.substring(code.length() - 4);
                }

                PdfPCell cellCod = new PdfPCell(new Phrase(code, fontValue));
                cellCod.setHorizontalAlignment(Element.ALIGN_CENTER);
                cellCod.setBorderColor(borderGray);
                cellCod.setPadding(8);
                tableItems.addCell(cellCod);

                PdfPCell cellCant = new PdfPCell(new Phrase(String.valueOf(detalle.getCantidad()), fontValue));
                cellCant.setHorizontalAlignment(Element.ALIGN_CENTER);
                cellCant.setBorderColor(borderGray);
                cellCant.setPadding(8);
                tableItems.addCell(cellCant);

                PdfPCell cellDesc = new PdfPCell(new Phrase(detalle.getProductoNombre() != null ? detalle.getProductoNombre().toUpperCase() : "", fontValue));
                cellDesc.setBorderColor(borderGray);
                cellDesc.setPadding(8);
                tableItems.addCell(cellDesc);

                PdfPCell cellPrecio = new PdfPCell(new Phrase("$" + String.format("%.2f", detalle.getPrecioUnitario()), fontValue));
                cellPrecio.setHorizontalAlignment(Element.ALIGN_RIGHT);
                cellPrecio.setBorderColor(borderGray);
                cellPrecio.setPadding(8);
                tableItems.addCell(cellPrecio);

                PdfPCell cellSub = new PdfPCell(new Phrase("$" + String.format("%.2f", detalle.getSubtotal()), fontBold));
                cellSub.setHorizontalAlignment(Element.ALIGN_RIGHT);
                cellSub.setBorderColor(borderGray);
                cellSub.setPadding(8);
                tableItems.addCell(cellSub);
            }
            document.add(tableItems);

            // ==================== 4. TOTALES ====================
            PdfPTable tableTotales = new PdfPTable(2);
            tableTotales.setWidthPercentage(100);
            tableTotales.setWidths(new float[]{7.5f, 2.5f});

            addPdfTotalRow(tableTotales, "SUBTOTAL", "$" + String.format("%.2f", venta.getSubtotal()), fontLabel, fontValue, borderGray);
            
            // Mostrar desglose dinámico de IVA
            if (venta.getDesgloseIva() != null && !venta.getDesgloseIva().isEmpty()) {
                for (java.util.Map.Entry<String, java.math.BigDecimal> entry : venta.getDesgloseIva().entrySet()) {
                    String pctLabel = "IVA " + (int)Double.parseDouble(entry.getKey()) + "%";
                    addPdfTotalRow(tableTotales, pctLabel, "$" + String.format("%.2f", entry.getValue()), fontLabel, fontValue, borderGray);
                }
            } else {
                addPdfTotalRow(tableTotales, "IVA TOTAL", "$" + String.format("%.2f", venta.getIva()), fontLabel, fontValue, borderGray);
            }
            
            addPdfTotalRow(tableTotales, "VALOR TOTAL", "$" + String.format("%.2f", venta.getTotal()), fontMaroonTotal, fontMaroonTotal, borderGray);

            document.add(tableTotales);

            document.close();
            return baos.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Error al generar factura PDF", e);
        }
    }

    private void addGridRow(PdfPTable table, String label, String value, Font fontLabel, Font fontValue, Color borderColor) {
        PdfPCell cellLabel = new PdfPCell(new Phrase(label, fontLabel));
        cellLabel.setBorder(Rectangle.BOTTOM);
        cellLabel.setBorderColor(borderColor);
        cellLabel.setPadding(4);
        table.addCell(cellLabel);

        PdfPCell cellValue = new PdfPCell(new Phrase(value, fontValue));
        cellValue.setBorder(Rectangle.BOTTOM);
        cellValue.setBorderColor(borderColor);
        cellValue.setPadding(4);
        cellValue.setHorizontalAlignment(Element.ALIGN_RIGHT);
        table.addCell(cellValue);
    }

    private void addClientField(PdfPTable table, String label, String value, Font fontLabel, Font fontValue) {
        PdfPCell cell = new PdfPCell();
        cell.setBorder(Rectangle.NO_BORDER);
        cell.setPadding(4);
        Paragraph p = new Paragraph();
        p.add(new Chunk(label + " ", fontLabel));
        p.add(new Chunk(value, fontValue));
        cell.addElement(p);
        table.addCell(cell);
    }

    private void addClientFieldColspan(PdfPTable table, String label, String value, Font fontLabel, Font fontValue) {
        PdfPCell cell = new PdfPCell();
        cell.setBorder(Rectangle.NO_BORDER);
        cell.setPadding(4);
        cell.setColspan(2);
        Paragraph p = new Paragraph();
        p.add(new Chunk(label + " ", fontLabel));
        p.add(new Chunk(value, fontValue));
        cell.addElement(p);
        table.addCell(cell);
    }

    private void addPdfTotalRow(PdfPTable table, String label, String value, Font fontLabel, Font fontValue, Color borderColor) {
        PdfPCell cellLabel = new PdfPCell(new Phrase(label, fontLabel));
        cellLabel.setBorder(Rectangle.LEFT | Rectangle.BOTTOM | Rectangle.RIGHT);
        cellLabel.setBorderColor(borderColor);
        cellLabel.setPadding(8);
        table.addCell(cellLabel);

        PdfPCell cellValue = new PdfPCell(new Phrase(value, fontValue));
        cellValue.setBorder(Rectangle.LEFT | Rectangle.BOTTOM | Rectangle.RIGHT);
        cellValue.setBorderColor(borderColor);
        cellValue.setPadding(8);
        cellValue.setHorizontalAlignment(Element.ALIGN_RIGHT);
        table.addCell(cellValue);
    }
}