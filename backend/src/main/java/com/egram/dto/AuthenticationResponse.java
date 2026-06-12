package com.egram.dto;

public record AuthenticationResponse(
        String accessToken,
        String tokenType
) {}
