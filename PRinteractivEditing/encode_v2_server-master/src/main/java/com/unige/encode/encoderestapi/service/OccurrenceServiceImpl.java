package com.unige.encode.encoderestapi.service;

import com.unige.encode.encoderestapi.model.EffortTypeOccurrence;
import com.unige.encode.encoderestapi.model.Occurrence;
import com.unige.encode.encoderestapi.model.OccurrenceFile;
import com.unige.encode.encoderestapi.model.OccurrenceScope;
import com.unige.encode.encoderestapi.repository.OccurrenceFileRepository;
import com.unige.encode.encoderestapi.repository.OccurrenceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.transaction.Transactional;
import java.util.List;

@Service
public class OccurrenceServiceImpl implements OccurrenceService{

    @Autowired private OccurrenceRepository occurrenceRepository;
    @Autowired private OccurrenceScopeService occurrenceScopeService;
    @Autowired private EffortTypeOccurrenceService effortTypeOccurrenceService;

    @Override
    public void saveOccurrence(Occurrence occurrence) { occurrenceRepository.save(occurrence); }

    @Override
    public void saveAllOccurrences(List<Occurrence> occurrences){
        occurrenceRepository.saveAll(occurrences);
    }

    @Override
    public Occurrence getOccurrenceById(long id) {
        return occurrenceRepository.getById(id);
    }

    @Override
    public List<Occurrence> getAllOccurrencesByTopicId(long id) {
        return occurrenceRepository.getAllByTopicId(id);
    }


    @Override
    @Transactional
    public void updateOccurrence(Occurrence newOccurrence, Occurrence oldOccurrence) {
        oldOccurrence.setDataValue(newOccurrence.getDataValue());
        oldOccurrence.setDataReference(newOccurrence.getDataReference());

        List<OccurrenceScope> newOccScope = newOccurrence.getOccurrenceOccurrenceScope();
        List<OccurrenceScope> oldOccScope = oldOccurrence.getOccurrenceOccurrenceScope();

        if(oldOccScope != null) {
            for (OccurrenceScope ts : oldOccScope) {
                if (newOccScope == null || !newOccScope.contains(ts)) {
                    occurrenceScopeService.delete(ts);
                }
            }
        }
        if(newOccScope != null) newOccScope.forEach(ts -> occurrenceScopeService.save(ts));

        List<EffortTypeOccurrence> newEffTypOcc = newOccurrence.getOccurrenceEffortType();
        List<EffortTypeOccurrence> oldEffTypOcc = oldOccurrence.getOccurrenceEffortType();

        if(oldEffTypOcc != null) {
            for (EffortTypeOccurrence eto : oldEffTypOcc) {
                if (newEffTypOcc == null || !newEffTypOcc.contains(eto)) {
                    effortTypeOccurrenceService.delete(eto);
                }
            }
        }
        if(newEffTypOcc != null) newEffTypOcc.forEach(eto -> effortTypeOccurrenceService.save(eto));

        saveOccurrence(oldOccurrence);
    }

    @Override
    public void deleteOccurrenceById(long id) {
        occurrenceRepository.deleteById(id);
    }

    @Override
    public boolean existsOccurrenceById(long id) {
        return occurrenceRepository.existsById(id);
    }

}
