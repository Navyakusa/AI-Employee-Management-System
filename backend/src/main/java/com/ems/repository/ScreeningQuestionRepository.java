package com.ems.repository;

import com.ems.entity.ScreeningQuestion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ScreeningQuestionRepository
        extends JpaRepository<ScreeningQuestion, Long> {

    long countByActiveTrue();

    long countByCategoryIgnoreCase(String category);

    List<ScreeningQuestion>
    findByCategoryIgnoreCase(String category);
}