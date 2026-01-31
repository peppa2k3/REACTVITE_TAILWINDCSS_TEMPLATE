const VideoCall = require("../models/VideoCall");
const Conversation = require("../models/Conversation");
const { v4: uuidv4 } = require("uuid");

// Initiate video call
exports.initiateCall = async (req, res) => {
  try {
    const { conversationId } = req.body;
    const userId = req.user.id;

    // Verify conversation
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    if (!conversation.isParticipant(userId)) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Create video call
    const roomId = uuidv4();
    const videoCall = await VideoCall.create({
      conversationId,
      caller: userId,
      roomId,
      status: "calling",
      participants: [
        {
          userId,
          joinedAt: new Date(),
        },
      ],
    });

    const populatedCall = await VideoCall.findById(videoCall._id)
      .populate("caller", "name email avatar")
      .populate("conversationId");

    res.status(201).json({ call: populatedCall });
  } catch (error) {
    console.error("Initiate call error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Join video call
exports.joinCall = async (req, res) => {
  try {
    const { callId } = req.params;
    const userId = req.user.id;

    const call = await VideoCall.findById(callId);
    if (!call) {
      return res.status(404).json({ message: "Call not found" });
    }

    // Check if user is already in call
    const existingParticipant = call.participants.find(
      (p) => p.userId.toString() === userId,
    );

    if (!existingParticipant) {
      call.participants.push({
        userId,
        joinedAt: new Date(),
      });
    }

    if (call.status === "calling") {
      call.status = "active";
      call.startedAt = new Date();
    }

    await call.save();

    const populatedCall = await VideoCall.findById(call._id)
      .populate("caller", "name email avatar")
      .populate("participants.userId", "name email avatar");

    res.json({ call: populatedCall });
  } catch (error) {
    console.error("Join call error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Leave video call
exports.leaveCall = async (req, res) => {
  try {
    const { callId } = req.params;
    const userId = req.user.id;

    const call = await VideoCall.findById(callId);
    if (!call) {
      return res.status(404).json({ message: "Call not found" });
    }

    // Update participant left time
    const participant = call.participants.find(
      (p) => p.userId.toString() === userId && !p.leftAt,
    );

    if (participant) {
      participant.leftAt = new Date();
    }

    // Check if all participants left
    const activeParticipants = call.participants.filter((p) => !p.leftAt);
    if (activeParticipants.length === 0) {
      call.status = "ended";
      call.endedAt = new Date();

      if (call.startedAt) {
        call.duration = Math.floor((call.endedAt - call.startedAt) / 1000);
      }
    }

    await call.save();

    res.json({ message: "Left call successfully" });
  } catch (error) {
    console.error("Leave call error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// End video call
exports.endCall = async (req, res) => {
  try {
    const { callId } = req.params;
    const userId = req.user.id;

    const call = await VideoCall.findById(callId);
    if (!call) {
      return res.status(404).json({ message: "Call not found" });
    }

    // Only caller can end call
    if (call.caller.toString() !== userId) {
      return res.status(403).json({ message: "Only caller can end the call" });
    }

    call.status = "ended";
    call.endedAt = new Date();

    if (call.startedAt) {
      call.duration = Math.floor((call.endedAt - call.startedAt) / 1000);
    }

    await call.save();

    res.json({ message: "Call ended successfully" });
  } catch (error) {
    console.error("End call error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Reject call
exports.rejectCall = async (req, res) => {
  try {
    const { callId } = req.params;

    const call = await VideoCall.findById(callId);
    if (!call) {
      return res.status(404).json({ message: "Call not found" });
    }

    call.status = "rejected";
    call.endedAt = new Date();
    await call.save();

    res.json({ message: "Call rejected" });
  } catch (error) {
    console.error("Reject call error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get call history
exports.getCallHistory = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

    // Verify conversation
    const conversation = await Conversation.findById(conversationId);
    if (!conversation || !conversation.isParticipant(userId)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const calls = await VideoCall.find({
      conversationId,
      status: { $in: ["ended", "missed", "rejected"] },
    })
      .populate("caller", "name email avatar")
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({ calls });
  } catch (error) {
    console.error("Get call history error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
