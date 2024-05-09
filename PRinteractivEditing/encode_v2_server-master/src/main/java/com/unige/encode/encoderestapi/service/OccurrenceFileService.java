package com.unige.encode.encoderestapi.service;

import com.unige.encode.encoderestapi.model.OccurrenceFile;

import java.util.List;

public interface OccurrenceFileService {

    void saveOccurrenceFile(OccurrenceFile occurrenceFile);
    void saveAllOccurrenceFiles(List<OccurrenceFile> occurrenceFiles);
    OccurrenceFile getOccurrenceFileById(long id);
    List<OccurrenceFile> getAllOccurrenceFilesByOccurrenceId(long id);
    void deleteOccurrenceFileById(long id);
    boolean existsOccurrenceFileById(long id);
}
