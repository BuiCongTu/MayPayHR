package fpt.aptech.springbootapp.api;

import fpt.aptech.springbootapp.entities.Core.TbLine;
import fpt.aptech.springbootapp.services.interfaces.LineService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/lines")
public class LineController {

    private final LineService lineService;

    @Autowired
    public LineController(LineService lineService) {
        this.lineService = lineService;
    }

    @GetMapping("/department/{deptId}")
    public ResponseEntity<List<TbLine>> getLinesByDepartment(@PathVariable Integer deptId) {
        try {
            List<TbLine> lines = lineService.getLinesByDepartment(deptId);
            return ResponseEntity.ok(lines);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}