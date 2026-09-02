using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace Infrastructure.Services;

public class EmbeddingService
{
    private readonly HttpClient _httpClient;
    private readonly string _model;
    private readonly string _apiKey;
    private readonly ILogger<EmbeddingService> _logger;

    public EmbeddingService(HttpClient httpClient, IConfiguration config,
                            ILogger<EmbeddingService> logger)
    {
        _httpClient = httpClient;
        _model = config["Gemini:EmbeddingModel"] ?? "gemini-embedding-001";
        _apiKey = config["Gemini:ApiKey"] ?? "";
        _logger = logger;
        _httpClient.BaseAddress = new Uri("https://generativelanguage.googleapis.com/");
    }

    public async Task<float[]?> GetEmbeddingAsync(string text) {
        if (string.IsNullOrEmpty(_apiKey) || _apiKey == "YOUR_GEMINI_API_KEY_HERE") {
             _logger.LogWarning("No valid Gemini API key found.");
             return null;
        }

        try {
            var request = new {
                model = $"models/{_model}",
                content = new {
                    parts = new[] {
                        new { text = text }
                    }
                }
            };

            var response = await _httpClient.PostAsJsonAsync($"v1beta/models/{_model}:embedContent?key={_apiKey}", request);
            
            if (!response.IsSuccessStatusCode) {
                var errorBody = await response.Content.ReadAsStringAsync();
                _logger.LogWarning("Gemini API error ({StatusCode}): {ErrorBody}", response.StatusCode, errorBody);
                return null;
            }

            var json = await response.Content.ReadFromJsonAsync<JsonElement>();
            var embedding = json.GetProperty("embedding")
                               .GetProperty("values")
                               .EnumerateArray()
                               .Select(e => e.GetSingle())
                               .ToArray();
            return embedding;
        }
        catch (Exception ex) {
            _logger.LogWarning(ex, "Failed to generate embedding");
            return null;
        }
    }

    public static string BuildProductText(string code, string name, string? description, string category) {
        return $"{code} {name} {description ?? ""} {category}".Trim();
    }

    public static double CosineSimilarity(float[] a, float[] b) {
        double dot = 0, normA = 0, normB = 0;
        for (int i = 0; i < a.Length; i++) {
            dot += a[i] * b[i];
            normA += a[i] * a[i];
            normB += b[i] * b[i];
        }
        var denominator = Math.Sqrt(normA) * Math.Sqrt(normB);
        if (denominator == 0) return 0;
        return dot / denominator;
    }
}
