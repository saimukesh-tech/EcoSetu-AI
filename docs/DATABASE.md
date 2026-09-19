# EcoSetu AI — Database Schema & Firestore Rules

## Firestore Collections

1. `users`
   - `uid` (string, PK)
   - `name` (string)
   - `email` (string)
   - `role` ('ORGANIZER' | 'RECOVERY_PARTNER' | 'ADMIN')
   - `createdAt` (timestamp)
   - `updatedAt` (timestamp)

2. `events`
   - `id` (string, PK)
   - `organizerUid` (string)
   - `name` (string)
   - `type` (string)
   - `date` (string)
   - `location` (string)
   - `guestCount` (number)
   - `duration` (number)
   - `foodType` (string)
   - `cateringType` (string)
   - `decorationType` (string)
   - `status` ('DRAFT' | 'ACTIVE' | 'COMPLETED')

3. `waste_predictions`
   - `id` (string, PK)
   - `uid` (string)
   - `eventId` (string, optional)
   - `input` (map)
   - `result` (map)
   - `createdAt` (timestamp)

4. `recovery_partners`
   - `id` (string, PK)
   - `uid` (string)
   - `orgName` (string)
   - `wasteTypes` (array of strings)
   - `capacityKg` (number)
   - `availableCapacityKg` (number)
   - `location` (string)
   - `available` (boolean)
   - `verified` (boolean)

5. `pickup_requests`
   - `id` (string, PK)
   - `organizerUid` (string)
   - `partnerUid` (string)
   - `wasteTypes` (array of strings)
   - `totalKg` (number)
   - `pickupDate` (string)
   - `pickupAddress` (string)
   - `status` ('PENDING' | 'MATCHED' | 'ACCEPTED' | 'SCHEDULED' | 'PICKUP_IN_PROGRESS' | 'COLLECTED' | 'RECOVERED' | 'COMPLETED' | 'CANCELLED')

6. `pickup_status_history`
   - `pickupRequestId` (string)
   - `status` (string)
   - `changedAt` (timestamp)
   - `changedBy` (string)

7. `impact_records`
   - `id` (string, PK)
   - `uid` (string)
   - `wasteKgDiverted` (number)
   - `co2Saved` (number)
   - `mealsRescued` (number)
   - `treesEquivalent` (number)

8. `chat_sessions` & `chat_messages`
   - `sessionId`, `uid`, `role`, `content`, `createdAt`
