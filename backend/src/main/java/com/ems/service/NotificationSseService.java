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
     * Stores all active SSE connections.
     *
     * One user can have multiple connections:
     *
     * User 1 -> Browser Tab 1
     *         -> Browser Tab 2
     */
    private final Map<Long, Set<SseEmitter>> emitters =
            new ConcurrentHashMap<>();


    // =========================================================
    // CONNECT USER TO SSE
    // =========================================================

    public SseEmitter connect(Long userId) {

        System.out.println("=================================");
        System.out.println("SSE CONNECT START");
        System.out.println("SSE USER ID = " + userId);
        System.out.println("=================================");

        if (userId == null) {
            throw new RuntimeException(
                    "Cannot create SSE connection: userId is null"
            );
        }

        /*
         * 0L = NO TIMEOUT
         *
         * The SSE connection remains open until:
         *
         * 1. Browser closes the connection
         * 2. Frontend disconnects
         * 3. Network/server connection fails
         * 4. Application is restarted
         */
        SseEmitter emitter = new SseEmitter(0L);

        System.out.println("SSE EMITTER CREATED");

        emitters
                .computeIfAbsent(
                        userId,
                        key -> ConcurrentHashMap.newKeySet()
                )
                .add(emitter);

        System.out.println("SSE EMITTER ADDED");
        System.out.println(
                "ACTIVE CONNECTIONS FOR USER = "
                        + emitters.get(userId).size()
        );


        // =====================================================
        // CONNECTION COMPLETED
        // =====================================================

        emitter.onCompletion(() -> {

            System.out.println(
                    "SSE CONNECTION COMPLETED"
                            + " | USER ID = "
                            + userId
            );

            removeEmitter(
                    userId,
                    emitter
            );
        });


        // =====================================================
        // CONNECTION TIMEOUT
        // =====================================================

        emitter.onTimeout(() -> {

            /*
             * With SseEmitter(0L), this should normally
             * never be called because there is no timeout.
             */

            System.out.println(
                    "SSE TIMEOUT"
                            + " | USER ID = "
                            + userId
            );

            removeEmitter(
                    userId,
                    emitter
            );

            emitter.complete();
        });


        // =====================================================
        // CONNECTION ERROR
        // =====================================================

        emitter.onError(error -> {

            System.out.println(
                    "SSE ERROR"
                            + " | USER ID = "
                            + userId
            );

            if (error != null) {
                error.printStackTrace();
            }

            removeEmitter(
                    userId,
                    emitter
            );
        });


        // =====================================================
        // SEND INITIAL CONNECTION EVENT
        // =====================================================

        try {

            System.out.println(
                    "SENDING SSE CONNECTED EVENT"
            );

            emitter.send(
                    SseEmitter.event()
                            .name("connected")
                            .data("Notification stream connected")
            );

            System.out.println(
                    "SSE CONNECTED EVENT SENT SUCCESSFULLY"
            );

        } catch (IOException e) {

            System.out.println(
                    "FAILED TO SEND SSE CONNECTED EVENT"
            );

            e.printStackTrace();

            removeEmitter(
                    userId,
                    emitter
            );

            emitter.completeWithError(e);
        }

        System.out.println("=================================");
        System.out.println("SSE CONNECT END");
        System.out.println("=================================");

        return emitter;
    }


    // =========================================================
    // SEND NOTIFICATION TO ALL USER CONNECTIONS
    // =========================================================

    public void sendNotification(
            Long userId,
            Notification notification
    ) {

        System.out.println(
                "SSE SEND NOTIFICATION"
                        + " | USER ID = "
                        + userId
        );

        Set<SseEmitter> userEmitters =
                emitters.get(userId);

        if (userEmitters == null ||
                userEmitters.isEmpty()) {

            System.out.println(
                    "NO ACTIVE SSE CONNECTION FOR USER = "
                            + userId
            );

            return;
        }

        /*
         * Copy the set before iterating.
         *
         * This prevents concurrent modification problems
         * when a connection closes while sending.
         */
        for (SseEmitter emitter :
                Set.copyOf(userEmitters)) {

            try {

                emitter.send(
                        SseEmitter.event()
                                .name("notification")
                                .data(notification)
                );

                System.out.println(
                        "SSE NOTIFICATION SENT"
                                + " | USER ID = "
                                + userId
                );

            } catch (Exception e) {

                System.out.println(
                        "FAILED TO SEND SSE NOTIFICATION"
                                + " | USER ID = "
                                + userId
                );

                e.printStackTrace();

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

        System.out.println(
                "SSE EMITTER REMOVED"
                        + " | USER ID = "
                        + userId
        );


        /*
         * If the user has no active connections anymore,
         * remove the user entry completely.
         */
        if (userEmitters.isEmpty()) {

            emitters.remove(userId);

            System.out.println(
                    "NO ACTIVE SSE CONNECTIONS"
                            + " | USER ID = "
                            + userId
            );
        }
    }
}