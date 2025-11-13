package com.attendance.service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import com.attendance.model.AttendanceRecord;
import com.attendance.repository.AttendanceRecordRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ExcelExportService {

  private final AttendanceRecordRepository attendanceRecordRepository;
  private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy/MM/dd");
  private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");

  /**
   * 指定期間の勤怠データをExcelに出力
   */
  public byte[] exportToExcel(LocalDateTime startDate, LocalDateTime endDate) throws IOException {
    List<AttendanceRecord> records = attendanceRecordRepository.findByDateRange(startDate, endDate);

    try (Workbook workbook = new XSSFWorkbook()) {
      Sheet sheet = workbook.createSheet("勤怠記録");

      // ヘッダースタイル
      CellStyle headerStyle = createHeaderStyle(workbook);

      // ヘッダー行作成
      Row headerRow = sheet.createRow(0);
      String[] headers = { "ユーザーID", "ユーザー名", "日付", "勤怠区分", "出勤時刻", "退勤時刻", "勤務時間" };
      for (int i = 0; i < headers.length; i++) {
        Cell cell = headerRow.createCell(i);
        cell.setCellValue(headers[i]);
        cell.setCellStyle(headerStyle);
      }

      // データ行作成
      CellStyle dataStyle = createDataStyle(workbook);
      int rowNum = 1;

      for (AttendanceRecord record : records) {
        Row row = sheet.createRow(rowNum++);

        Cell cell0 = row.createCell(0);
        cell0.setCellValue(record.getUser().getUserId());
        cell0.setCellStyle(dataStyle);

        Cell cell1 = row.createCell(1);
        cell1.setCellValue(record.getUser().getUsername());
        cell1.setCellStyle(dataStyle);

        Cell cell2 = row.createCell(2);
        cell2.setCellValue(record.getRecordDate().format(DATE_FORMATTER));
        cell2.setCellStyle(dataStyle);

        Cell cell3 = row.createCell(3);
        String attendanceTypeText = "ANNUAL_LEAVE".equals(record.getAttendanceType()) ? "年休" : "通常勤務";
        cell3.setCellValue(attendanceTypeText);
        cell3.setCellStyle(dataStyle);

        Cell cell4 = row.createCell(4);
        if (record.getCheckInTime() != null) {
          cell4.setCellValue(record.getCheckInTime().format(TIME_FORMATTER));
        } else if ("ANNUAL_LEAVE".equals(record.getAttendanceType())) {
          cell4.setCellValue("-");
        }
        cell4.setCellStyle(dataStyle);

        Cell cell5 = row.createCell(5);
        if (record.getCheckOutTime() != null) {
          cell5.setCellValue(record.getCheckOutTime().format(TIME_FORMATTER));
        } else if ("ANNUAL_LEAVE".equals(record.getAttendanceType())) {
          cell5.setCellValue("-");
        }
        cell5.setCellStyle(dataStyle);

        Cell cell6 = row.createCell(6);
        if ("ANNUAL_LEAVE".equals(record.getAttendanceType())) {
          cell6.setCellValue("年休");
        } else if (record.getCheckInTime() != null && record.getCheckOutTime() != null) {
          long hours = java.time.Duration.between(
              record.getCheckInTime(),
              record.getCheckOutTime()).toHours();
          long minutes = java.time.Duration.between(
              record.getCheckInTime(),
              record.getCheckOutTime()).toMinutesPart();
          cell6.setCellValue(String.format("%d時間%d分", hours, minutes));
        }
        cell6.setCellStyle(dataStyle);
      }

      // 列幅自動調整
      for (int i = 0; i < headers.length; i++) {
        sheet.autoSizeColumn(i);
      }

      // ByteArrayに変換
      ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
      workbook.write(outputStream);
      return outputStream.toByteArray();
    }
  }

  /**
   * ヘッダースタイルを作成
   */
  private CellStyle createHeaderStyle(Workbook workbook) {
    CellStyle style = workbook.createCellStyle();
    style.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
    style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
    style.setBorderBottom(BorderStyle.THIN);
    style.setBorderTop(BorderStyle.THIN);
    style.setBorderLeft(BorderStyle.THIN);
    style.setBorderRight(BorderStyle.THIN);

    Font font = workbook.createFont();
    font.setBold(true);
    style.setFont(font);

    return style;
  }

  /**
   * データスタイルを作成
   */
  private CellStyle createDataStyle(Workbook workbook) {
    CellStyle style = workbook.createCellStyle();
    style.setBorderBottom(BorderStyle.THIN);
    style.setBorderTop(BorderStyle.THIN);
    style.setBorderLeft(BorderStyle.THIN);
    style.setBorderRight(BorderStyle.THIN);
    return style;
  }
}
