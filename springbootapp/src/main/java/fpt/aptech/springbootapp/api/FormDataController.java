package fpt.aptech.springbootapp.api;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import fpt.aptech.springbootapp.dtos.response.ApiResponse;
import fpt.aptech.springbootapp.entities.Core.TbRole;
import fpt.aptech.springbootapp.entities.Core.TbSkillLevel;
import fpt.aptech.springbootapp.repositories.RoleRepository;
import fpt.aptech.springbootapp.repositories.SkillLevelRepo;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/form-data")
@RequiredArgsConstructor
public class FormDataController {

    private final RoleRepository roleRepository;
    private final SkillLevelRepo skillLevelRepo;

    @GetMapping("/roles")
    public ResponseEntity<ApiResponse<List<TbRole>>> getRoles() {
        try {
            List<TbRole> roles = roleRepository.findAll();
            return ResponseEntity.ok(ApiResponse.success(roles));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to fetch roles: " + e.getMessage()));
        }
    }

    @GetMapping("/skill-levels")
    public ResponseEntity<ApiResponse<List<TbSkillLevel>>> getSkillLevels() {
        try {
            List<TbSkillLevel> skillLevels = skillLevelRepo.findAll();
            return ResponseEntity.ok(ApiResponse.success(skillLevels));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to fetch skill levels: " + e.getMessage()));
        }
    }
}
