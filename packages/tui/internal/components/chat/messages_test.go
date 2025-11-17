package chat

import (
	"testing"
)

// TestShimmerBlockKindConstants tests that shimmer block kind constants are properly defined
func TestShimmerBlockKindConstants(t *testing.T) {
	// Verify that the shimmer block kinds are correctly ordered
	if shimmerBlockReasoning != 0 {
		t.Errorf("Expected shimmerBlockReasoning to be 0, got %d", shimmerBlockReasoning)
	}
	
	if shimmerBlockTool != 1 {
		t.Errorf("Expected shimmerBlockTool to be 1, got %d", shimmerBlockTool)
	}
	
	if shimmerBlockGenerating != 2 {
		t.Errorf("Expected shimmerBlockGenerating to be 2, got %d", shimmerBlockGenerating)
	}
}

// TestShimmerKeyFunction tests the shimmer key generation
func TestShimmerKeyFunction(t *testing.T) {
	key1 := shimmerKey(shimmerBlockTool, "test-part-id")
	key2 := shimmerKey(shimmerBlockTool, "test-part-id")
	key3 := shimmerKey(shimmerBlockReasoning, "test-part-id")
	
	// Same kind and ID should generate same key
	if key1 != key2 {
		t.Errorf("Expected same key for same parameters, got %s and %s", key1, key2)
	}
	
	// Different kind should generate different key
	if key1 == key3 {
		t.Errorf("Expected different keys for different kinds, got %s for both", key1)
	}
	
	// Verify key format includes kind and ID
	if key1 == "" {
		t.Error("Expected non-empty shimmer key")
	}
}

// TestShimmerKeyFunctionEdgeCases tests edge cases for shimmer key generation
func TestShimmerKeyFunctionEdgeCases(t *testing.T) {
	// Test with empty part ID
	keyWithEmptyID := shimmerKey(shimmerBlockTool, "")
	if keyWithEmptyID == "" {
		t.Error("Expected non-empty shimmer key even with empty part ID")
	}
	
	// Test with different kinds
	keys := make(map[string]bool)
	keys[shimmerKey(shimmerBlockTool, "test")] = true
	keys[shimmerKey(shimmerBlockReasoning, "test")] = true
	keys[shimmerKey(shimmerBlockGenerating, "test")] = true
	
	if len(keys) != 3 {
		t.Errorf("Expected 3 unique keys for different kinds, got %d", len(keys))
	}
}