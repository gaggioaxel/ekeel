package com.unige.encode.encoderestapi.service;

import com.unige.encode.encoderestapi.model.Occurrence;
import com.unige.encode.encoderestapi.model.OccurrenceFile;

import java.util.List;

public interface OccurrenceService {

    void saveOccurrence(Occurrence occurrence);
    void saveAllOccurrences(List<Occurrence> occurrences);
    Occurrence getOccurrenceById(long id);
    List<Occurrence> getAllOccurrencesByTopicId(long id);
    void updateOccurrence(Occurrence newOccurrence, Occurrence oldOccurrence);
    void deleteOccurrenceById(long id);
    boolean existsOccurrenceById(long id);
}
