package com.ems.controller;

import com.ems.dto.RoleRequestDTO;
import com.ems.dto.RoleResponseDTO;
import com.ems.service.RoleService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/roles")
@CrossOrigin(origins = "*")
public class RoleController {

    private final RoleService roleService;

    public RoleController(RoleService roleService) {
        this.roleService = roleService;
    }

    // Get all roles
    @GetMapping("/all")
    public ResponseEntity<List<RoleResponseDTO>> getAllRoles() {

        return ResponseEntity.ok(
                roleService.getAllRoles()
        );
    }

    // Get role by ID
    @GetMapping("/{id}")
    public ResponseEntity<RoleResponseDTO> getRoleById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                roleService.getRoleById(id)
        );
    }

    // Create role
    @PostMapping("/create")
    public ResponseEntity<RoleResponseDTO> createRole(
            @Valid @RequestBody RoleRequestDTO dto) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(roleService.createRole(dto));
    }

    // Update role
    @PutMapping("/{id}")
    public ResponseEntity<RoleResponseDTO> updateRole(
            @PathVariable Long id,
            @Valid @RequestBody RoleRequestDTO dto) {

        return ResponseEntity.ok(
                roleService.updateRole(id, dto)
        );
    }

    // Delete role
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRole(
            @PathVariable Long id) {

        roleService.deleteRole(id);

        return ResponseEntity.noContent().build();
    }

    // Search roles
    @GetMapping("/search")
    public ResponseEntity<List<RoleResponseDTO>> searchRoles(
            @RequestParam String keyword) {

        return ResponseEntity.ok(
                roleService.searchRoles(keyword)
        );
    }
}