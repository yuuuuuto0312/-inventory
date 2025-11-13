package com.attendance.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.attendance.dto.AttendanceRequest;
import com.attendance.dto.AttendanceResponse;
import com.attendance.model.AttendanceRecord;
import com.attendance.model.User;
import com.attendance.repository.AttendanceRecordRepository;
import com.attendance.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class AttendanceService {

  private final AttendanceRecordRepository attendanceRecordRepository;
  private final UserRepository userRepository;

  /**
   * 出勤・退勤・年休を記録
   */
  @Transactional
  public AttendanceResponse recordAttendance(AttendanceRequest request) {
    User user = userRepository.findById(request.getUserId())
        .orElseThrow(() -> new RuntimeException("ユーザーが見つかりません"));

    LocalDateTime now = LocalDateTime.now();
    LocalDate today = now.toLocalDate();
    LocalDateTime startOfDay = today.atStartOfDay();
    LocalDateTime endOfDay = today.atTime(LocalTime.MAX);

    // 今日の勤怠記録を取得
    Optional<AttendanceRecord> existingRecord = attendanceRecordRepository
        .findFirstByUserAndRecordDateBetween(user, startOfDay, endOfDay);

    AttendanceRecord record;

    if ("CHECK_IN".equals(request.getType())) {
      if (existingRecord.isPresent() && existingRecord.get().getCheckInTime() != null) {
        throw new RuntimeException("既に出勤記録が存在します");
      }

      record = new AttendanceRecord();
      record.setUser(user);
      record.setCheckInTime(now);
      record.setRecordDate(now);
      record.setAttendanceType("WORK");

      record = attendanceRecordRepository.save(record);

    } else if ("CHECK_OUT".equals(request.getType())) {
      record = existingRecord
          .orElseThrow(() -> new RuntimeException("出勤記録が見つかりません"));

      if (record.getCheckOutTime() != null) {
        throw new RuntimeException("既に退勤記録が存在します");
      }

      record.setCheckOutTime(now);

      record = attendanceRecordRepository.save(record);

    } else if ("ANNUAL_LEAVE".equals(request.getType())) {
      if (existingRecord.isPresent()) {
        throw new RuntimeException("既に本日の勤怠記録が存在します");
      }

      record = new AttendanceRecord();
      record.setUser(user);
      record.setRecordDate(now);
      record.setAttendanceType("ANNUAL_LEAVE");
      record.setCheckInTime(null);
      record.setCheckOutTime(null);

      record = attendanceRecordRepository.save(record);

    } else {
      throw new RuntimeException("無効なタイプです");
    }

    return mapToResponse(record);
  }

  /**
   * ユーザーの勤怠記録を取得
   */
  public List<AttendanceResponse> getUserAttendanceRecords(Long userId) {
    User user = userRepository.findById(userId)
        .orElseThrow(() -> new RuntimeException("ユーザーが見つかりません"));

    return attendanceRecordRepository.findByUserOrderByRecordDateDesc(user)
        .stream()
        .map(this::mapToResponse)
        .collect(Collectors.toList());
  }

  /**
   * 今日の勤怠状況を取得
   */
  public AttendanceResponse getTodayAttendance(Long userId) {
    User user = userRepository.findById(userId)
        .orElseThrow(() -> new RuntimeException("ユーザーが見つかりません"));

    LocalDate today = LocalDate.now();
    LocalDateTime startOfDay = today.atStartOfDay();
    LocalDateTime endOfDay = today.atTime(LocalTime.MAX);

    Optional<AttendanceRecord> record = attendanceRecordRepository
        .findFirstByUserAndRecordDateBetween(user, startOfDay, endOfDay);

    return record.map(this::mapToResponse).orElse(null);
  }

  /**
   * 期間指定で全ユーザーの勤怠記録を取得(管理者用)
   */
  public List<AttendanceResponse> getAttendanceRecordsByDateRange(
      LocalDateTime startDate,
      LocalDateTime endDate) {

    return attendanceRecordRepository.findByDateRange(startDate, endDate)
        .stream()
        .map(this::mapToResponse)
        .collect(Collectors.toList());
  }

  /**
   * エンティティをレスポンスDTOに変換
   */
  private AttendanceResponse mapToResponse(AttendanceRecord record) {
    AttendanceResponse response = new AttendanceResponse();
    response.setRecordId(record.getRecordId());
    response.setUserId(record.getUser().getUserId());
    response.setUsername(record.getUser().getUsername());
    response.setCheckInTime(record.getCheckInTime());
    response.setCheckOutTime(record.getCheckOutTime());
    response.setRecordDate(record.getRecordDate());
    response.setAttendanceType(record.getAttendanceType());

    // ステータスを設定
    if ("ANNUAL_LEAVE".equals(record.getAttendanceType())) {
      response.setStatus("ANNUAL_LEAVE");
    } else {
      response.setStatus(record.getCheckOutTime() == null ? "IN_PROGRESS" : "COMPLETED");
    }

    return response;
  }
}
