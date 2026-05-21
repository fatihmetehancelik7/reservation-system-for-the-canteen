package com.yemekhane.controller;

import com.yemekhane.dto.MonthlyMenuDto;
import com.yemekhane.service.MenuService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;

@RestController
@RequestMapping("/api/menus")
@RequiredArgsConstructor
public class MenuController {

    private final MenuService menuService;

    @GetMapping("/{yil}/{ay}")
    public ResponseEntity<List<MonthlyMenuDto>> getMenusByMonth(@PathVariable Integer yil, @PathVariable Integer ay) {
        return ResponseEntity.ok(menuService.getMenusByMonth(yil, ay));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<MonthlyMenuDto> createMenu(@Valid @RequestBody MonthlyMenuDto request) {
        return ResponseEntity.ok(menuService.createMenu(request));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/batch")
    public ResponseEntity<List<MonthlyMenuDto>> createMenus(@RequestBody List<MonthlyMenuDto> requests) {
        return ResponseEntity.ok(menuService.createMenus(requests));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMenu(@PathVariable Long id) {
        menuService.deleteMenu(id);
        return ResponseEntity.ok().build();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<MonthlyMenuDto> updateMenu(@PathVariable Long id, @Valid @RequestBody MonthlyMenuDto request) {
        return ResponseEntity.ok(menuService.updateMenu(id, request));
    }
}
