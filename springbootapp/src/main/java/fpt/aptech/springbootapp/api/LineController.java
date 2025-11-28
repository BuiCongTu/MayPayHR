package fpt.aptech.springbootapp.api;

import fpt.aptech.springbootapp.dtos.response.ApiResponse;
import fpt.aptech.springbootapp.entities.Core.TbLine;
import fpt.aptech.springbootapp.services.interfaces.LineService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/lines")
public class LineController {

    private final LineService lineService;

    @Autowired
    public LineController(LineService lineService) {
        this.lineService = lineService;
    }

    //lấy tất cả line trong 1 dept
    @GetMapping("/department/{deptId}")
    public ResponseEntity<ApiResponse<List<TbLine>>> getLinesByDepartment(@PathVariable Integer deptId) {
        try {
            if (deptId == null || deptId <= 0) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Invalid department ID"));
            }

            List<TbLine> lines = lineService.getLinesByDepartment(deptId);
            return ResponseEntity.ok(ApiResponse.success("Lines retrieved successfully", lines));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve lines: " + e.getMessage()));
        }
    }

    //lay toan bo cau truc phan cap cua 1 dept theo level
    @GetMapping("/hierarchy/{deptId}")
    public ResponseEntity<ApiResponse<List<TbLine>>> getLineHierarchy(@PathVariable Integer deptId) {
        try {
            if (deptId == null || deptId <= 0) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Invalid department ID"));
            }
            List<TbLine> hierarchy = lineService.getLineHierarchyByDepartment(deptId);
            return ResponseEntity.ok(ApiResponse.success("Line hierarchy retrieved successfully", hierarchy));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve line hierarchy: " + e.getMessage()));
        }
    }

    // lay toan bo cau truc dang tree structure voiws children day du
    @GetMapping("/tree/{deptId}")
    public ResponseEntity<ApiResponse<TbLine>> getLineTree(@PathVariable Integer deptId) {
        try {
            if (deptId == null || deptId <= 0) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Invalid department ID"));
            }
            TbLine tree = lineService.getLineTreeByDepartment(deptId);
            if (tree == null) {
                return ResponseEntity.ok(
                        ApiResponse.success("No lines found for this department", null));
            }

            return ResponseEntity.ok(
                    ApiResponse.success("Line tree retrieved successfully", tree));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve line tree: " + e.getMessage()));
        }
    }

    //lay tat ca root lines level 1 cua dept
    @GetMapping("/root/{departmentId}")
    public ResponseEntity<ApiResponse<List<TbLine>>> getRootLines(
            @PathVariable Integer departmentId) {
        try {
            log.info("Request: Get root lines for department {}", departmentId);

            if (departmentId == null || departmentId <= 0) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Invalid department ID"));
            }

            List<TbLine> rootLines = lineService.getRootLines(departmentId);
            return ResponseEntity.ok(
                    ApiResponse.success("Root lines retrieved successfully", rootLines));
        } catch (Exception e) {
            log.error("Error fetching root lines", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve root lines: " + e.getMessage()));
        }
    }

    //lay cac child lines cua 1 line
    @GetMapping("/children/{parentLineId}")
    public ResponseEntity<ApiResponse<List<TbLine>>> getChildLines(@PathVariable Integer parentLineId) {
        try {
            if (parentLineId == null || parentLineId <= 0) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Invalid parent line ID"));
            }

            List<TbLine> children = lineService.getChildLines(parentLineId);
            return ResponseEntity.ok(
                    ApiResponse.success("Child lines retrieved successfully", children));
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(ex.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve child lines: " + e.getMessage()));
        }
    }

    // lay path day du tu root toi 1 line
    @GetMapping("/path/{lineId}")
    public ResponseEntity<ApiResponse<List<TbLine>>> getPath(@PathVariable Integer lineId) {
        try {
            if (lineId == null || lineId <= 0) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Invalid line ID"));
            }
            List<TbLine> path = lineService.getLinePathToRoot(lineId);
            return ResponseEntity.ok(
                    ApiResponse.success("Line path retrieved successfully", path));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve line path: " + e.getMessage()));
        }
    }

    // lay tat ca ancestors
    @GetMapping("/ancestors/{lineId}")
    public ResponseEntity<ApiResponse<List<TbLine>>> getAncestors(@PathVariable Integer lineId) {
        try {
            if (lineId == null || lineId <= 0) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Invalid line ID"));
            }
            List<TbLine> ancestors = lineService.getLineAncestors(lineId);
            return ResponseEntity.ok(
                    ApiResponse.success("Ancestors retrieved successfully", ancestors));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve ancestors: " + e.getMessage()));
        }
    }

    // lay cac line theo level
    @GetMapping("/by-level/{deptId}/{level}")
    public ResponseEntity<ApiResponse<List<TbLine>>> getLineByLevel(
            @PathVariable Integer deptId,
            @PathVariable Integer level) {
        try {
            if (deptId == null || deptId <= 0) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Invalid dept ID"));
            }
            if (level == null || level <= 0) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Invalid level"));
            }
            List<TbLine> lines = lineService.getLineByLevel(deptId, level);
            return ResponseEntity.ok(
                    ApiResponse.success("Lines retrieved successfully", lines));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve line by level: " + e.getMessage()));
        }
    }

}