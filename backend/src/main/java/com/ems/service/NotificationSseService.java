package com.ems.service;

import com.ems.entity.Notification;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class NotificationSseService {

    /*
     * One user can have multiple SSE connections.
     *
     * Example:
     *
     * User 1 -> Browser Tab 1
     *         -> Browser Tab 2
     *
     * User 2 -> Browser Tab 1
     */
    private final Map<Long, Set<SseEmitter>> emitters =
            new ConcurrentHashMap<>();


    // =========================================================
    // CONNECT USER TO SSE
    // =========================================================

    public SseEmitter connect(Long userId) {

        SseEmitter emitter =
                new SseEmitter(30 * 60 * 1000L);

        emitters
                .computeIfAbsent(
                        userId,
                        key -> ConcurrentHashMap.newKeySet()
                )
                .add(emitter);


        // =====================================================
        // CONNECTION COMPLETED
        // =====================================================

        emitter.onCompletion(() ->
                removeEmitter(userId, emitter)
        );


        // =====================================================
        // CONNECTION TIMEOUT
        // =====================================================

        emitter.onTimeout(() -> {

            removeEmitter(userId, emitter);

            emitter.complete();
        });


        // =====================================================
        // CONNECTION ERROR
        // =====================================================

        emitter.onError(error -> {

            removeEmitter(userId, emitter);
        });


        // =====================================================
        // SEND CONNECTION EVENT
        // =====================================================

        try {

            emitter.send(
                    SseEmitter.event()
                            .name("connected")
                            .data("Notification stream connected")
            );

        } catch (IOException e) {

            removeEmitter(userId, emitter);

            emitter.completeWithError(e);
        }

        return emitter;
    }


    // =========================================================
    // SEND NOTIFICATION TO ALL USER CONNECTIONS
    // =========================================================

    public void sendNotification(
            Long userId,
            Notification notification
    ) {

        Set<SseEmitter> userEmitters =
                emitters.get(userId);

        if (userEmitters == null ||
                userEmitters.isEmpty()) {

            return;
        }


        /*
         * Copy the set before iterating.
         *
         * This avoids concurrent modification problems
         * when a connection closes while we are sending.
         */
        for (SseEmitter emitter :
                Set.copyOf(userEmitters)) {

            try {

                emitter.send(
                        SseEmitter.event()
                                .name("notification")
                                .data(notification)
                );

            } catch (Exception e) {

                removeEmitter(
                        userId,
                        emitter
                );

                emitter.complete();
            }
        }
    }


    // =========================================================
    // REMOVE ONE CONNECTION
    // =========================================================

    private void removeEmitter(
            Long userId,
            SseEmitter emitter
    ) {

        Set<SseEmitter> userEmitters =
                emitters.get(userId);

        if (userEmitters == null) {
            return;
        }

        userEmitters.remove(emitter);


        /*
         * If the user has no active connections anymore,
         * remove the user entry completely.
         */
        if (userEmitters.isEmpty()) {

            emitters.remove(userId);
        }
    }
}