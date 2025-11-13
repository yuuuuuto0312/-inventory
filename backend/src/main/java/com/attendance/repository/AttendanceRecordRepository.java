package com.attendance.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.attendance.model.AttendanceRecord;
import com.attendance.model.User;

@Repository
public interface AttendanceRecordRepository extends JpaRepository<AttendanceRecord, Long> {

    List<AttendanceRecord> findByUserOrderByRecordDateDesc(User user);

    Optional<AttendanceRecord> findFirstByUserAndRecordDateBetween(
            User user,
            LocalDateTime startOfDay,
            LocalDateTime endOfDay);

    @Query("SELECT a FROM AttendanceRecord a WHERE " +
            "a.recordDate >= :startDate AND a.recordDate <= :endDate " +
            "ORDER BY a.user.userId, a.recordDate")
    List<AttendanceRecord> findByDateRange(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    List<AttendanceRecord> findAllByUserAndRecordDateBetween(
            User user,
            LocalDateTime startDate,
            LocalDateTime endDate);
}
