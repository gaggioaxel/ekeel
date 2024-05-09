package com.unige.encode.encoderestapi.service;

import com.unige.encode.encoderestapi.model.OccurrenceFile;
import com.unige.encode.encoderestapi.repository.OccurrenceFileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.transaction.Transactional;
import java.util.List;

@Service
public class OccurrenceFileServiceImpl implements OccurrenceFileService{

    @Autowired private OccurrenceFileRepository occurrenceFileRepository;


    @Override
    public void saveOccurrenceFile(OccurrenceFile occurrenceFile) { occurrenceFileRepository.save(occurrenceFile); }

    @Override
    public void saveAllOccurrenceFiles(List<OccurrenceFile> occurrenceFiles){
        occurrenceFileRepository.saveAll(occurrenceFiles);
    }

    @Override
    public OccurrenceFile getOccurrenceFileById(long id) {
        return occurrenceFileRepository.getById(id);
    }

    @Override
    public List<OccurrenceFile> getAllOccurrenceFilesByOccurrenceId(long id) {
        return occurrenceFileRepository.getAllByOccurrenceId(id);
    }

    @Override
    public void deleteOccurrenceFileById(long id) {
        occurrenceFileRepository.deleteById(id);
    }

    @Override
    public boolean existsOccurrenceFileById(long id) {
        return occurrenceFileRepository.existsById(id);
    }

}
