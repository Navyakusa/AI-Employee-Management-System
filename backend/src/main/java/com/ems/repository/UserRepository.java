package com.ems.repository;

import com.ems.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmailIgnoreCase(String email);

    List<User> findByRole(String role);

    List<User> findByUserNameContainingIgnoreCaseOrEmailContainingIgnoreCase(
            String userName,
            String email
    );

    List<User> findByRoleIgnoreCase(String role);

    long countByActive(boolean b);

    long countByRoleIgnoreCase(String employee);

    @Query("""
       SELECT u.role, COUNT(u)
       FROM User u
       WHERE u.role IS NOT NULL
       GROUP BY u.role
       """)
    List<Object[]> countUsersByRole();

    @Query("""
       SELECT u
       FROM User u
       ORDER BY
           CASE WHEN u.createdDate IS NULL THEN 1 ELSE 0 END,
           u.createdDate DESC
       """)
    List<User> findAllUsersForRecentUsers();
}