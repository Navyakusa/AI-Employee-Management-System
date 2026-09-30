package com.ems.service;

import com.ems.entity.Notification;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class NotificationSseService {

    private final Map<Long, SseEmitter> emitters =
            new ConcurrentHashMap<>();

    // =========================================================
    // CONNECT USER TO SSE
    // =========================================================

    public SseEmitter connect(Long userId) {

        SseEmitter emitter =
                new SseEmitter(30 * 60 * 1000L);

        emitters.put(userId, emitter);

        emitter.onCompletion(
                () -> emitters.remove(userId)
        );

        emitter.onTimeout(
                () -> {
                    emitters.remove(userId);
                    emitter.complete();
                }
        );

        emitter.onError(
                error -> emitters.remove(userId)
        );

        try {

            emitter.send(
                    SseEmitter.event()
                            .name("connected")
                            .data("Notification stream connected")
            );

        } catch (IOException e) {

            emitters.remove(userId);
            emitter.completeWithError(e);
        }

        return emitter;
    }

    // =========================================================
    // SEND NOTIFICATION TO USER
    // =========================================================

    public void sendNotification(
            Long userId,
            Notification notification
    ) {

        SseEmitter emitter =
                emitters.get(userId);

        if (emitter == null) {
            return;
        }

        try {

            emitter.send(
                    SseEmitter.event()
                            .name("notification")
                            .data(notification)
            );

        } catch (Exception e) {

            emitters.remove(userId);
            emitter.complete();
        }
    }
}