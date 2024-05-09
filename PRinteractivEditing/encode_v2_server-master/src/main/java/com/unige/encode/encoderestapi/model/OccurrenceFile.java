package com.unige.encode.encoderestapi.model;

import com.fasterxml.jackson.annotation.JsonIgnore;

import javax.persistence.*;

@Entity
@Table(name = "encode_occurrences_files", schema = "unige_encode_db", catalog = "")
public class OccurrenceFile {
    private long id;
    private String name;
    private String path;
    private long occurrenceId;
    private Occurrence fileOccurrence;

    public OccurrenceFile(){}

    public OccurrenceFile(String name, String path, long occurrenceId, Occurrence occurrence) {
        this.name = name;
        this.path = path;
        this.occurrenceId = occurrenceId;
        this.fileOccurrence = occurrence;
    }

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "id", nullable = false)
    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    @Basic
    @Column(name = "name", nullable = false, length = 60)
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    @Basic
    @Column(name = "path", nullable = false, length = 512)
    public String getPath() {
        return path;
    }

    public void setPath(String path) {
        this.path = path;
    }

    @Basic
    @Column(name = "occurrence_id", nullable = false, insertable = false, updatable = false)
    public long getOccurrenceId() {
        return occurrenceId;
    }

    public void setOccurrenceId(long occurrenceId) {
        this.occurrenceId = occurrenceId;
    }

    @ManyToOne
    @JoinColumn(name = "occurrence_id", referencedColumnName = "id", nullable = false)
    @JsonIgnore
    public Occurrence getFileOccurrence() {
        return fileOccurrence;
    }

    public void setFileOccurrence(Occurrence fileOccurrence) {
        this.fileOccurrence = fileOccurrence;
    }
}
