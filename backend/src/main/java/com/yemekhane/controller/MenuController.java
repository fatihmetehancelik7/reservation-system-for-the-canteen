package com.yemekhane.controller;

import com.yemekhane.dto.MonthlyMenuDto;
import com.yemekhane.service.MenuService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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

    @PostMapping
    public ResponseEntity<MonthlyMenuDto> createMenu(@RequestBody MonthlyMenuDto request) {
        return ResponseEntity.ok(menuService.createMenu(request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMenu(@PathVariable Long id) {
        menuService.deleteMenu(id);
        return ResponseEntity.ok().build();
    }
}
