package com.egram.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public class EgramException extends RuntimeException {

    private final HttpStatus status;

    public EgramException(String message, HttpStatus status) {
        super(message);
        this.status = status;
    }

    public EgramException(String message) {
        super(message);
        this.status = HttpStatus.BAD_REQUEST;
    }
}
